import type { NextApiRequest, NextApiResponse } from 'next'
import { GetObjectCommand, NoSuchKey } from '@aws-sdk/client-s3'
import { Readable } from 'stream'
import { validateAwsConfig } from '@/utils/validation/awsConfigValidation'
import { validateAndDecodeKey } from '@/utils/validation/validateAndDecodeKey'
import { isValidImageType } from '@/utils/validation/isValidImageType'
import { getS3Client, getBucketName } from '@/utils/s3'
import { ErrorCodes } from '@/common/errors'
import { CACHE_MAX_AGE, MAX_FILE_SIZE } from '@/config/app'

function handleS3Error(
	error: unknown,
	decodedKey: string,
	res: NextApiResponse
) {
	if (error instanceof NoSuchKey) {
		return res.status(404).json({
			code: ErrorCodes.NOT_FOUND,
			message: 'Image not found',
		})
	}

	if (
		error &&
		typeof error === 'object' &&
		'name' in error &&
		(error.name === 'AccessDenied' || error.name === 'Forbidden')
	) {
		console.error('[S3 Image Proxy] Access denied:', decodedKey)
		return res.status(403).json({
			code: ErrorCodes.FORBIDDEN,
			message: 'Access denied',
		})
	}

	throw error
}

function setupResponseHeaders(
	res: NextApiResponse,
	contentType: string,
	etag?: string,
	contentLength?: number
) {
	res.setHeader('Content-Type', contentType)
	res.setHeader('Cache-Control', `public, max-age=${CACHE_MAX_AGE}, immutable`)

	if (etag) {
		res.setHeader('ETag', `"${etag}"`)
	}

	if (contentLength) {
		res.setHeader('Content-Length', contentLength.toString())
	}
}

function setupStreamHandlers(
	stream: Readable,
	req: NextApiRequest,
	res: NextApiResponse
) {
	stream.on('error', (error: Error) => {
		if (!res.headersSent) {
			res.status(500).json({
				code: ErrorCodes.INTERNAL_SERVER_ERROR,
				message: 'Error reading image stream',
				error: error.message,
			})
		} else {
			res.end()
		}
	})

	req.on('close', () => {
		if (!stream.destroyed) {
			stream.destroy()
		}
	})
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		return res.status(405).json({
			code: ErrorCodes.METHOD_NOT_ALLOWED,
			message: 'Method not allowed',
		})
	}

	try {
		const BUCKET_NAME = getBucketName()

		const configValidation = validateAwsConfig()
		if (!configValidation.isValid) {
			return res.status(500).json({
				code: ErrorCodes.INTERNAL_SERVER_ERROR,
				message: 'Server configuration error',
				error: configValidation.error,
			})
		}

		const keyValidation = validateAndDecodeKey(req.query.key)
		if (!keyValidation.isValid || !keyValidation.decodedKey) {
			return res.status(400).json({
				code: ErrorCodes.BAD_REQUEST,
				message: keyValidation.error || 'Invalid request',
			})
		}

		const decodedKey = keyValidation.decodedKey
		const s3Client = getS3Client()

		const command = new GetObjectCommand({
			Bucket: BUCKET_NAME,
			Key: decodedKey,
		})

		let response
		try {
			response = await s3Client.send(command)
		} catch (error: unknown) {
			return handleS3Error(error, decodedKey, res)
		}

		if (!response.Body) {
			return res.status(404).json({
				code: ErrorCodes.NOT_FOUND,
				message: 'Image not found',
			})
		}

		const contentType = response.ContentType || 'application/octet-stream'

		if (!isValidImageType(contentType)) {
			console.warn('[S3 Image Proxy] Invalid content type:', {
				key: decodedKey,
				contentType,
			})
			return res.status(400).json({
				code: ErrorCodes.BAD_REQUEST,
				message: 'Invalid file type',
			})
		}

		const contentLength = response.ContentLength

		if (contentLength && contentLength > MAX_FILE_SIZE) {
			return res.status(413).json({
				code: ErrorCodes.FILE_TOO_LARGE,
				message: 'File size exceeds limit',
			})
		}

		const etag = response.ETag?.replace(/"/g, '') || undefined

		setupResponseHeaders(res, contentType, etag, contentLength)

		const stream = response.Body as Readable
		setupStreamHandlers(stream, req, res)
		stream.pipe(res)
	} catch (error) {
		console.error('[S3 Image Proxy] Unexpected error:', error)
		if (!res.headersSent) {
			return res.status(500).json({
				code: ErrorCodes.INTERNAL_SERVER_ERROR,
				message: 'Internal server error',
				error: error instanceof Error ? error.message : String(error),
			})
		}
	}
}

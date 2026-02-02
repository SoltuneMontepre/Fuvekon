import type { NextApiRequest, NextApiResponse } from 'next'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { validateAwsConfig } from '@/utils/validation/awsConfigValidation'
import { validateFolder } from '@/utils/validation/folderValidation'
import { generateFileKey } from '@/utils/s3/fileKey'
import { generateS3PublicUrl } from '@/utils/s3/url'
import { getS3Client, getAwsRegion } from '@/utils/s3'
import { ErrorCodes } from '@/common/errors'
import type { PresignRequest } from '@/types/api/s3/presign'

export const config = {
	api: {
		bodyParser: {
			sizeLimit: '1mb',
		},
	},
}

function parseRequestBody(req: NextApiRequest): PresignRequest {
	return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
}

function validatePresignRequest(body: PresignRequest): {
	isValid: boolean
	error?: string
} {
	const { fileName, fileType, folder } = body

	if (!fileName || !fileType) {
		return {
			isValid: false,
			error: 'fileName and fileType are required',
		}
	}

	if (folder) {
		const folderValidation = validateFolder(folder)
		if (!folderValidation.isValid) {
			return folderValidation
		}
	}

	return { isValid: true }
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		return res.status(405).json({
			isSuccess: false,
			message: 'Method not allowed',
			code: ErrorCodes.METHOD_NOT_ALLOWED,
			data: null,
			statusCode: 405,
		})
	}

	try {
		const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME
		const region = getAwsRegion()

		const configValidation = validateAwsConfig()
		if (!configValidation.isValid) {
			return res.status(500).json({
				isSuccess: false,
				message: 'Server configuration error',
				code: ErrorCodes.INTERNAL_SERVER_ERROR,
				error: configValidation.error,
				data: null,
				statusCode: 500,
			})
		}

		let body: PresignRequest
		try {
			body = parseRequestBody(req)
		} catch {
			return res.status(400).json({
				isSuccess: false,
				message: 'Invalid JSON in request body',
				code: ErrorCodes.BAD_REQUEST,
				data: null,
				statusCode: 400,
			})
		}

		const requestValidation = validatePresignRequest(body)
		if (!requestValidation.isValid) {
			return res.status(400).json({
				isSuccess: false,
				message: requestValidation.error,
				code: ErrorCodes.BAD_REQUEST,
				data: null,
				statusCode: 400,
			})
		}

		const { fileName, fileType, folder, expiresIn = 3600 } = body

		// Double-check environment variables (defensive programming)
		if (!BUCKET_NAME || !region) {
			return res.status(500).json({
				isSuccess: false,
				message: 'Server configuration error: Missing AWS configuration',
				code: ErrorCodes.INTERNAL_SERVER_ERROR,
				error: 'Missing AWS_S3_BUCKET_NAME or NLF_AWS_REGION',
				data: null,
				statusCode: 500,
			})
		}

		const s3Client = getS3Client()
		const fileKey = generateFileKey(fileName, folder)

		const command = new PutObjectCommand({
			Bucket: BUCKET_NAME,
			Key: fileKey,
			ContentType: fileType,
		})

		const presignedUrl = await getSignedUrl(s3Client, command, {
			expiresIn,
		})

		const fileUrl = generateS3PublicUrl(BUCKET_NAME, region, fileKey)

		return res.status(200).json({
			isSuccess: true,
			message: 'Presigned URL generated successfully',
			data: {
				presignedUrl,
				fileKey,
				fileUrl,
			},
			statusCode: 200,
		})
	} catch (error) {
		console.error('[S3 Presign] Error generating presigned URL:', error)

		// Extract error message
		let errorMessage = 'Failed to generate presigned URL'
		if (error instanceof Error) {
			errorMessage = error.message
		} else if (typeof error === 'object' && error !== null) {
			errorMessage = JSON.stringify(error)
		}

		return res.status(500).json({
			isSuccess: false,
			message: errorMessage,
			code: ErrorCodes.INTERNAL_SERVER_ERROR,
			error: errorMessage,
			data: null,
			statusCode: 500,
		})
	}
}

import type { NextApiRequest, NextApiResponse } from 'next'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { validateAwsConfig } from '@/utils/validation/awsConfigValidation'
import { validateAndDecodeKey } from '@/utils/validation/validateAndDecodeKey'
import { getS3Client, getBucketName } from '@/utils/s3'
import { ErrorCodes } from '@/common/errors'

/** Signed GET URL expiry in seconds (short-lived; browser loads image immediately). */
const SIGNED_GET_EXPIRES_IN = 60

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

		const signedUrl = await getSignedUrl(s3Client, command, {
			expiresIn: SIGNED_GET_EXPIRES_IN,
		})

		// Don't cache redirect: signed URL expires in 60s; CDN (e.g. Netlify) must not serve stale redirects
		res.setHeader('Cache-Control', 'private, no-store, max-age=0')
		res.redirect(302, signedUrl)
	} catch (error) {
		console.error('[S3 Image] Error generating signed GET URL:', error)
		if (!res.headersSent) {
			return res.status(500).json({
				code: ErrorCodes.INTERNAL_SERVER_ERROR,
				message: 'Internal server error',
				error: error instanceof Error ? error.message : String(error),
			})
		}
	}
}

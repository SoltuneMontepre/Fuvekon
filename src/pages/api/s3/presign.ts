import type { NextApiRequest, NextApiResponse } from 'next'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { PresignRequest } from '@/types/api/s3/presign'

// Disable default body parser to handle JSON manually if needed
export const config = {
	api: {
		bodyParser: {
			sizeLimit: '1mb',
		},
	},
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Only allow POST method
	if (req.method !== 'POST') {
		return res.status(405).json({
			isSuccess: false,
			message: 'Method not allowed',
			data: null,
			statusCode: 405,
		})
	}

	try {
		// Parse and validate request body
		let body: PresignRequest
		try {
			body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
		} catch {
			return res.status(400).json({
				isSuccess: false,
				message: 'Invalid JSON in request body',
				data: null,
				statusCode: 400,
			})
		}

		const { fileName, fileType, folder, expiresIn = 3600 } = body

		// Validate required fields
		if (!fileName || !fileType) {
			return res.status(400).json({
				isSuccess: false,
				message: 'fileName and fileType are required',
				data: null,
				statusCode: 400,
			})
		}

		// Validate folder parameter to prevent path traversal
		if (folder) {
			// Check for dangerous patterns
			if (
				folder.includes('..') ||
				folder.includes('/') ||
				folder.includes('\\') ||
				folder.startsWith('.')
			) {
				return res.status(400).json({
					isSuccess: false,
					message: 'Invalid folder parameter: path traversal detected',
					data: null,
					statusCode: 400,
				})
			}

			// Validate folder name format (alphanumeric, dots, dashes, underscores only)
			if (!/^[a-zA-Z0-9._-]+$/.test(folder)) {
				return res.status(400).json({
					isSuccess: false,
					message: 'Invalid folder parameter: contains invalid characters',
					data: null,
					statusCode: 400,
				})
			}
		}

		// Validate AWS configuration before initializing S3Client
		const AWS_REGION = process.env.AWS_REGION
		const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
		const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
		const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME

		const missingVars: string[] = []
		if (!BUCKET_NAME) missingVars.push('AWS_S3_BUCKET_NAME')
		if (!AWS_ACCESS_KEY_ID) missingVars.push('AWS_ACCESS_KEY_ID')
		if (!AWS_SECRET_ACCESS_KEY) missingVars.push('AWS_SECRET_ACCESS_KEY')
		if (!AWS_REGION) missingVars.push('AWS_REGION')

		if (missingVars.length > 0) {
			return res.status(500).json({
				isSuccess: false,
				message: `Missing required environment variables: ${missingVars.join(
					', '
				)}. Please configure your .env file.`,
				data: null,
				statusCode: 500,
			})
		}

		// Initialize S3 client only after validation
		// At this point, all variables are guaranteed to be defined due to validation above
		const s3Client = new S3Client({
			region: AWS_REGION!,
			credentials: {
				accessKeyId: AWS_ACCESS_KEY_ID!,
				secretAccessKey: AWS_SECRET_ACCESS_KEY!,
			},
		})

		// Generate unique file key
		const timestamp = Date.now()
		const randomString = Math.random().toString(36).substring(2, 15)
		// Remove path separators and sanitize to prevent path traversal
		const sanitizedFileName = fileName
			.replace(/[\/\\]/g, '') // Remove all path separators
			.replace(/^\.+/, '') // Remove leading dots
			.replace(/[^a-zA-Z0-9.-]/g, '_')
		// Use sanitized folder if provided (already validated above)
		const fileKey = folder
			? `${folder}/${timestamp}-${randomString}-${sanitizedFileName}`
			: `${timestamp}-${randomString}-${sanitizedFileName}`

		// Create PutObject command
		// At this point, BUCKET_NAME is guaranteed to be defined due to validation above
		const command = new PutObjectCommand({
			Bucket: BUCKET_NAME!,
			Key: fileKey,
			ContentType: fileType,
			// Optional: Add metadata or ACL settings here
			// Metadata: { uploadedBy: userId },
			// ACL: 'public-read', // or 'private'
		})

		// Generate presigned URL
		const presignedUrl = await getSignedUrl(s3Client, command, {
			expiresIn, // URL expires in specified seconds
		})

		// Construct the public URL (adjust based on your bucket configuration)
		const fileUrl = `https://${BUCKET_NAME!}.s3.${AWS_REGION!}.amazonaws.com/${fileKey}`

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
		console.error('Error generating presigned URL:', error)
		return res.status(500).json({
			isSuccess: false,
			message:
				error instanceof Error
					? error.message
					: 'Failed to generate presigned URL',
			data: null,
			statusCode: 500,
		})
	}
}

import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { PresignRequest } from '@/types/api/s3/presign'

// Initialize S3 client
const s3Client = new S3Client({
	region: process.env.AWS_REGION || 'us-east-1',
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
	},
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || ''

export async function POST(request: NextRequest) {
	try {
		const body: PresignRequest = await request.json()
		const { fileName, fileType, folder, expiresIn = 3600 } = body

		// Validate required fields
		if (!fileName || !fileType) {
			return NextResponse.json(
				{
					isSuccess: false,
					message: 'fileName and fileType are required',
					data: null,
					statusCode: 400,
				},
				{ status: 400 }
			)
		}

		// Validate AWS configuration
		const missingVars: string[] = []
		if (!BUCKET_NAME) missingVars.push('AWS_S3_BUCKET_NAME')
		if (!process.env.AWS_ACCESS_KEY_ID) missingVars.push('AWS_ACCESS_KEY_ID')
		if (!process.env.AWS_SECRET_ACCESS_KEY)
			missingVars.push('AWS_SECRET_ACCESS_KEY')
		if (!process.env.AWS_REGION) missingVars.push('AWS_REGION')

		if (missingVars.length > 0) {
			return NextResponse.json(
				{
					isSuccess: false,
					message: `Missing required environment variables: ${missingVars.join(
						', '
					)}. Please configure your .env file.`,
					data: null,
					statusCode: 500,
				},
				{ status: 500 }
			)
		}

		// Generate unique file key
		const timestamp = Date.now()
		const randomString = Math.random().toString(36).substring(2, 15)
		const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
		const fileKey = folder
			? `${folder}/${timestamp}-${randomString}-${sanitizedFileName}`
			: `${timestamp}-${randomString}-${sanitizedFileName}`

		// Create PutObject command
		const command = new PutObjectCommand({
			Bucket: BUCKET_NAME,
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
		const fileUrl = `https://${BUCKET_NAME}.s3.${
			process.env.AWS_REGION || 'us-east-1'
		}.amazonaws.com/${fileKey}`

		return NextResponse.json({
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
		return NextResponse.json(
			{
				isSuccess: false,
				message:
					error instanceof Error
						? error.message
						: 'Failed to generate presigned URL',
				data: null,
				statusCode: 500,
			},
			{ status: 500 }
		)
	}
}

import type { NextApiRequest, NextApiResponse } from 'next'
import { S3Client, GetObjectCommand, NoSuchKey } from '@aws-sdk/client-s3'
import { Readable } from 'stream'

// ============================================================================
// Configuration & Constants
// ============================================================================

// Allowed image MIME types for security
const ALLOWED_MIME_TYPES = new Set([
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/gif',
	'image/webp',
	'image/svg+xml',
	'image/avif',
])

// Maximum file size (50MB) - adjust as needed
const MAX_FILE_SIZE = 50 * 1024 * 1024

// Cache duration (1 year for immutable assets)
const CACHE_MAX_AGE = 31536000

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates AWS configuration
 */
function validateAwsConfig(): { isValid: boolean; error?: string } {
	const AWS_REGION = process.env.AWS_REGION
	const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
	const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
	const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME

	const missing: string[] = []

	if (!BUCKET_NAME) missing.push('AWS_S3_BUCKET_NAME')
	if (!AWS_ACCESS_KEY_ID) missing.push('AWS_ACCESS_KEY_ID')
	if (!AWS_SECRET_ACCESS_KEY) missing.push('AWS_SECRET_ACCESS_KEY')
	if (!AWS_REGION) missing.push('AWS_REGION')

	if (missing.length > 0) {
		return {
			isValid: false,
			error: `Missing required environment variables: ${missing.join(', ')}`,
		}
	}

	return { isValid: true }
}

/**
 * Validates and sanitizes the S3 key
 * Prevents path traversal attacks and validates format
 */
function validateAndDecodeKey(key: string | string[] | null | undefined): {
	isValid: boolean
	decodedKey?: string
	error?: string
} {
	if (!key || (typeof key === 'string' && key.trim().length === 0)) {
		return { isValid: false, error: 'Missing key parameter' }
	}

	// Handle array case (shouldn't happen, but be safe)
	const keyStr = Array.isArray(key) ? key[0] : key

	// Decode the key (handle multiple encodings)
	let decodedKey = keyStr
	try {
		// Decode up to 3 times to handle multiple encodings
		for (let i = 0; i < 3; i++) {
			const prevKey = decodedKey
			decodedKey = decodeURIComponent(decodedKey)
			if (prevKey === decodedKey) break
		}
	} catch {
		// If decoding fails, use the original key
		decodedKey = keyStr
	}

	// Security: Prevent path traversal attacks
	if (decodedKey.includes('..') || decodedKey.startsWith('/')) {
		return {
			isValid: false,
			error: 'Invalid key format: path traversal detected',
		}
	}

	// Validate key length (S3 key limit is 1024 bytes)
	if (Buffer.byteLength(decodedKey, 'utf8') > 1024) {
		return {
			isValid: false,
			error: 'Key exceeds maximum length',
		}
	}

	return { isValid: true, decodedKey }
}

/**
 * Validates MIME type is an allowed image type
 */
function isValidImageType(contentType: string | undefined): boolean {
	if (!contentType) return false
	return ALLOWED_MIME_TYPES.has(contentType.toLowerCase())
}

// ============================================================================
// API Route Handler
// ============================================================================

/**
 * GET /api/s3/image
 *
 * Proxy route to fetch images from S3 with proper authentication.
 * This route:
 * - Validates input and AWS configuration
 * - Fetches images from S3 using AWS credentials
 * - Streams the response for better performance
 * - Applies security checks and proper caching headers
 *
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 *
 * @example
 * GET /api/s3/image?key=user-uploads/filename.jpg
 */
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const startTime = Date.now()

	// Only allow GET method
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' })
	}

	try {
		// Validate AWS configuration before initializing S3Client
		const AWS_REGION = process.env.AWS_REGION
		const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
		const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
		const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME

		const configValidation = validateAwsConfig()
		if (!configValidation.isValid) {
			console.error(
				'[S3 Image Proxy] Configuration error:',
				configValidation.error
			)
			return res.status(500).json({ error: 'Server configuration error' })
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

		// Extract and validate key parameter
		const key = req.query.key

		const keyValidation = validateAndDecodeKey(key)
		if (!keyValidation.isValid || !keyValidation.decodedKey) {
			console.warn('[S3 Image Proxy] Invalid key:', {
				key,
				error: keyValidation.error,
				ip:
					req.headers['x-forwarded-for'] ||
					req.headers['x-real-ip'] ||
					req.socket.remoteAddress,
			})
			return res
				.status(400)
				.json({ error: keyValidation.error || 'Invalid request' })
		}

		const decodedKey = keyValidation.decodedKey

		// Create GetObject command
		const command = new GetObjectCommand({
			Bucket: BUCKET_NAME!,
			Key: decodedKey,
		})

		// Fetch object from S3
		let response
		try {
			response = await s3Client.send(command)
		} catch (error: unknown) {
			// Handle AWS SDK specific errors
			if (error instanceof NoSuchKey) {
				console.warn('[S3 Image Proxy] Image not found:', decodedKey)
				return res.status(404).json({ error: 'Image not found' })
			}

			// Check for access denied errors (AWS SDK v3 uses error codes)
			if (
				error &&
				typeof error === 'object' &&
				'name' in error &&
				(error.name === 'AccessDenied' || error.name === 'Forbidden')
			) {
				console.error('[S3 Image Proxy] Access denied:', decodedKey)
				return res.status(403).json({ error: 'Access denied' })
			}

			// Re-throw unknown errors
			throw error
		}

		// Validate response
		if (!response.Body) {
			console.warn('[S3 Image Proxy] Empty response body:', decodedKey)
			return res.status(404).json({ error: 'Image not found' })
		}

		// Validate content type
		const contentType = response.ContentType || 'application/octet-stream'
		if (!isValidImageType(contentType)) {
			console.warn('[S3 Image Proxy] Invalid content type:', {
				key: decodedKey,
				contentType,
			})
			return res.status(400).json({ error: 'Invalid file type' })
		}

		// Check file size if available
		const contentLength = response.ContentLength
		if (contentLength && contentLength > MAX_FILE_SIZE) {
			console.warn('[S3 Image Proxy] File too large:', {
				key: decodedKey,
				size: contentLength,
			})
			return res.status(413).json({ error: 'File too large' })
		}

		// Calculate ETag for caching (use S3 ETag if available)
		const etag = response.ETag?.replace(/"/g, '') || undefined

		// Set response headers
		res.setHeader('Content-Type', contentType)
		res.setHeader(
			'Cache-Control',
			`public, max-age=${CACHE_MAX_AGE}, immutable`
		)

		// Add ETag for conditional requests
		if (etag) {
			res.setHeader('ETag', `"${etag}"`)
		}

		// Add content length if available
		if (contentLength) {
			res.setHeader('Content-Length', contentLength.toString())
		}

		// Log successful request
		const duration = Date.now() - startTime
		console.log('[S3 Image Proxy] Success:', {
			key: decodedKey,
			contentType,
			size: contentLength,
			duration: `${duration}ms`,
		})

		// Stream the response
		// In Pages Router, we can pipe the stream directly to the response
		const stream = response.Body as Readable

		// Handle stream errors before piping
		stream.on('error', (error: Error) => {
			console.error('[S3 Image Proxy] Stream error:', error)
			if (!res.headersSent) {
				res.status(500).json({ error: 'Failed to stream image' })
			} else {
				// If headers already sent, we can't send JSON, just end the response
				res.end()
			}
		})

		// Handle response close/abort
		req.on('close', () => {
			if (stream && !stream.destroyed) {
				stream.destroy()
			}
		})

		// Pipe the stream to the response
		stream.pipe(res)
	} catch (error) {
		// Log error with context
		const duration = Date.now() - startTime
		console.error('[S3 Image Proxy] Unexpected error:', {
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
			duration: `${duration}ms`,
		})

		// Return generic error (don't expose internal details)
		if (!res.headersSent) {
			return res.status(500).json({ error: 'Failed to fetch image' })
		}
	}
}

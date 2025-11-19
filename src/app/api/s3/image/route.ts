import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand, NoSuchKey } from '@aws-sdk/client-s3'
import { Readable } from 'stream'

// ============================================================================
// Configuration & Constants
// ============================================================================

const AWS_REGION = process.env.AWS_REGION || 'us-east-1'
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME

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
// S3 Client Initialization
// ============================================================================

const s3Client = new S3Client({
	region: AWS_REGION,
	credentials:
		AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
			? {
					accessKeyId: AWS_ACCESS_KEY_ID,
					secretAccessKey: AWS_SECRET_ACCESS_KEY,
			  }
			: undefined,
})

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates AWS configuration
 */
function validateAwsConfig(): { isValid: boolean; error?: string } {
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
function validateAndDecodeKey(key: string | null): {
	isValid: boolean
	decodedKey?: string
	error?: string
} {
	if (!key || key.trim().length === 0) {
		return { isValid: false, error: 'Missing key parameter' }
	}

	// Decode the key (handle multiple encodings)
	let decodedKey = key
	try {
		// Decode up to 3 times to handle multiple encodings
		for (let i = 0; i < 3; i++) {
			const prevKey = decodedKey
			decodedKey = decodeURIComponent(decodedKey)
			if (prevKey === decodedKey) break
		}
	} catch {
		// If decoding fails, use the original key
		decodedKey = key
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
// Stream Utilities
// ============================================================================

/**
 * Converts Node.js Readable stream to Web ReadableStream for Next.js
 * This allows streaming the response instead of loading entire file into memory
 */
function nodeStreamToWebStream(
	nodeStream: Readable
): ReadableStream<Uint8Array> {
	return new ReadableStream({
		start(controller) {
			nodeStream.on('data', (chunk: Buffer) => {
				controller.enqueue(new Uint8Array(chunk))
			})

			nodeStream.on('end', () => {
				controller.close()
			})

			nodeStream.on('error', (error: Error) => {
				controller.error(error)
			})
		},
		cancel() {
			nodeStream.destroy()
		},
	})
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
 * @param request - Next.js request object
 * @returns Image response or error
 *
 * @example
 * GET /api/s3/image?key=user-uploads/filename.jpg
 */
export async function GET(request: NextRequest) {
	const startTime = Date.now()

	try {
		// Validate AWS configuration
		const configValidation = validateAwsConfig()
		if (!configValidation.isValid) {
			console.error(
				'[S3 Image Proxy] Configuration error:',
				configValidation.error
			)
			return NextResponse.json(
				{ error: 'Server configuration error' },
				{ status: 500 }
			)
		}

		// Extract and validate key parameter
		const searchParams = request.nextUrl.searchParams
		const key = searchParams.get('key')

		const keyValidation = validateAndDecodeKey(key)
		if (!keyValidation.isValid || !keyValidation.decodedKey) {
			console.warn('[S3 Image Proxy] Invalid key:', {
				key,
				error: keyValidation.error,
				ip:
					request.headers.get('x-forwarded-for') ||
					request.headers.get('x-real-ip'),
			})
			return NextResponse.json(
				{ error: keyValidation.error || 'Invalid request' },
				{ status: 400 }
			)
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
				return NextResponse.json({ error: 'Image not found' }, { status: 404 })
			}

			// Check for access denied errors (AWS SDK v3 uses error codes)
			if (
				error &&
				typeof error === 'object' &&
				'name' in error &&
				(error.name === 'AccessDenied' || error.name === 'Forbidden')
			) {
				console.error('[S3 Image Proxy] Access denied:', decodedKey)
				return NextResponse.json({ error: 'Access denied' }, { status: 403 })
			}

			// Re-throw unknown errors
			throw error
		}

		// Validate response
		if (!response.Body) {
			console.warn('[S3 Image Proxy] Empty response body:', decodedKey)
			return NextResponse.json({ error: 'Image not found' }, { status: 404 })
		}

		// Validate content type
		const contentType = response.ContentType || 'application/octet-stream'
		if (!isValidImageType(contentType)) {
			console.warn('[S3 Image Proxy] Invalid content type:', {
				key: decodedKey,
				contentType,
			})
			return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
		}

		// Check file size if available
		const contentLength = response.ContentLength
		if (contentLength && contentLength > MAX_FILE_SIZE) {
			console.warn('[S3 Image Proxy] File too large:', {
				key: decodedKey,
				size: contentLength,
			})
			return NextResponse.json({ error: 'File too large' }, { status: 413 })
		}

		// Convert Node.js stream to Web ReadableStream
		const stream = response.Body as Readable
		const webStream = nodeStreamToWebStream(stream)

		// Calculate ETag for caching (use S3 ETag if available)
		const etag = response.ETag?.replace(/"/g, '') || undefined

		// Build response headers
		const headers = new Headers({
			'Content-Type': contentType,
			'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, immutable`,
		})

		// Add ETag for conditional requests
		if (etag) {
			headers.set('ETag', `"${etag}"`)
		}

		// Add content length if available
		if (contentLength) {
			headers.set('Content-Length', contentLength.toString())
		}

		// Add CORS headers if needed (adjust based on your requirements)
		// headers.set('Access-Control-Allow-Origin', '*')

		// Log successful request
		const duration = Date.now() - startTime
		console.log('[S3 Image Proxy] Success:', {
			key: decodedKey,
			contentType,
			size: contentLength,
			duration: `${duration}ms`,
		})

		// Return streamed response
		return new NextResponse(webStream, {
			status: 200,
			headers,
		})
	} catch (error) {
		// Log error with context
		const duration = Date.now() - startTime
		console.error('[S3 Image Proxy] Unexpected error:', {
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
			duration: `${duration}ms`,
		})

		// Return generic error (don't expose internal details)
		return NextResponse.json(
			{ error: 'Failed to fetch image' },
			{ status: 500 }
		)
	}
}

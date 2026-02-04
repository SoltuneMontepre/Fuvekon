import { S3Client } from '@aws-sdk/client-s3'

/**
 * Converts an S3 URL to an API URL that redirects to a signed GET URL.
 * The API generates a short-lived presigned GET URL and redirects the client,
 * so the browser loads the image directly from S3 (no streaming through the server).
 * @param s3Url - The full S3 URL (e.g., https://bucket.s3.region.amazonaws.com/key)
 * @returns The API URL (e.g., /api/s3/image?key=user-uploads/filename.png)
 */
export function getS3ProxyUrl(s3Url: string): string {
	try {
		const url = new URL(s3Url)

		const key = url.pathname.substring(1) // Remove leading slash

		if (!key) {
			// If we can't extract the key, return the original URL
			return s3Url
		}

		// Return the API URL (backend redirects to signed GET URL)
		return `/api/s3/image?key=${encodeURIComponent(key)}`
	} catch (error) {
		// If URL parsing fails, return the original URL
		console.warn('Failed to parse S3 URL:', s3Url, error)
		return s3Url
	}
}

/**
 * Checks if a URL is an S3 URL that should be proxied
 * @param url - The URL to check
 * @returns True if the URL is an S3 URL
 */
export function isS3Url(url: string): boolean {
	try {
		const urlObj = new URL(url)
		return (
			urlObj.hostname.includes('s3') &&
			urlObj.hostname.includes('amazonaws.com')
		)
	} catch {
		return false
	}
}

const STRIP_QUOTES_REGEX = /^["'\s]+|["'\s]+$/g

/** Returns value with surrounding quotes/whitespace stripped (avoids invalid values when env has quotes). */
export function stripEnvValue(value: string | undefined): string {
	return (value ?? '').replace(STRIP_QUOTES_REGEX, '')
}

/** Returns NLF_AWS_REGION with surrounding quotes/whitespace stripped (avoids "invalid hostname" when env has quotes). */
export function getAwsRegion(): string {
	return stripEnvValue(process.env.NLF_AWS_REGION)
}

/** Returns AWS_S3_BUCKET_NAME with surrounding quotes/whitespace stripped. */
export function getBucketName(): string {
	return stripEnvValue(process.env.AWS_S3_BUCKET_NAME)
}

export function getS3Client() {
	const region = getAwsRegion()
	const accessKeyId = stripEnvValue(process.env.NLF_AWS_ACCESS_KEY_ID)
	const secretAccessKey = stripEnvValue(process.env.NLF_AWS_SECRET_ACCESS_KEY)

	return new S3Client({
		region,
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
	})
}

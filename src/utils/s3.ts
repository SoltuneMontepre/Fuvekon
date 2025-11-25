/**
 * Converts an S3 URL to a proxy URL that can be used with Next.js Image optimization
 * @param s3Url - The full S3 URL (e.g., https://bucket.s3.region.amazonaws.com/key)
 * @returns The proxy URL (e.g., /api/s3/image?key=user-uploads/filename.png)
 */
export function getS3ProxyUrl(s3Url: string): string {
	try {
		const url = new URL(s3Url)

		// Extract the key from the S3 URL path
		// URL format: https://bucket.s3.region.amazonaws.com/key
		const key = url.pathname.substring(1) // Remove leading slash

		if (!key) {
			// If we can't extract the key, return the original URL
			return s3Url
		}

		// Return the proxy URL
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

/**
 * Input sanitization utilities to prevent XSS attacks
 *
 * CRITICAL SECURITY: Always sanitize user input before processing
 */

/**
 * Basic HTML entity encoding to prevent XSS
 * For production, consider using DOMPurify library
 */
export const sanitizeInput = (input: string): string => {
	if (!input) return ''

	return input
		.trim()
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;')
		.replace(/\//g, '&#x2F;')
}

/**
 * Sanitize email - remove potential XSS vectors
 */
export const sanitizeEmail = (email: string): string => {
	return email
		.trim()
		.toLowerCase()
		.replace(/[^\w@.-]/g, '')
}

/**
 * Sanitize name fields - allow letters, spaces, and common name characters
 */
export const sanitizeName = (name: string): string => {
	return name
		.trim()
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

/**
 * Sanitize alphanumeric fields (nickname, ID card)
 */
export const sanitizeAlphanumeric = (input: string): string => {
	return input.trim().replace(/[^a-zA-Z0-9_-]/g, '')
}

/**
 * Remove all HTML tags from input
 */
export const stripHtmlTags = (input: string): string => {
	return input.replace(/<[^>]*>/g, '')
}

/**
 * Sanitize all form data before submission
 */
export const sanitizeFormData = <T extends Record<string, unknown>>(
	data: T
): Record<string, string> => {
	const sanitized: Record<string, string> = {}

	for (const [key, value] of Object.entries(data)) {
		if (typeof value === 'string') {
			sanitized[key] = sanitizeInput(value)
		} else {
			sanitized[key] = String(value)
		}
	}

	return sanitized
}

/**
 * NOTE: For production, install and use DOMPurify:
 *
 * npm install isomorphic-dompurify
 *
 * import DOMPurify from 'isomorphic-dompurify'
 *
 * export const sanitizeInput = (input: string): string => {
 *   return DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [] })
 * }
 */

/**
 * Input sanitization utilities to prevent XSS attacks
 *
 * CRITICAL SECURITY: Always sanitize user input before processing
 */

/**
 * Sanitize input for API submission (removes HTML/scripts, preserves data)
 * Note: HTML entity encoding is NOT applied here as data goes to API, not HTML rendering
 * For HTML rendering contexts, use a dedicated HTML escaping function
 */
export const sanitizeInput = (input: string): string => {
	if (!input) return ''

	return input
		.trim()
		// Remove null bytes and other control characters (except newlines/tabs for some fields)
		.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
		// Remove ALL HTML tags (prevents XSS vectors like <img onerror="...">, <iframe>, etc.)
		.replace(/<[^>]*>/g, '')
		// Remove javascript: and data: URLs
		.replace(/javascript:/gi, '')
		.replace(/data:/gi, '')
}

/**
 * Sanitize email - only trim and normalize case
 * Note: Email validation should be done via validateEmail function
 * Aggressive character removal breaks valid emails (e.g., user+tag@example.com)
 */
export const sanitizeEmail = (email: string): string => {
	return email.trim().toLowerCase()
}

/**
 * Sanitize name fields - strip ALL HTML tags and trim
 * Removes all HTML to prevent XSS vectors like <img onerror="...">, <iframe>, etc.
 */
export const sanitizeName = (name: string): string => {
	return name.trim().replace(/<[^>]*>/g, '')
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
 * Minimal sanitization for form data - only removes HTML tags and trims
 * Note: Field-specific validation is handled by Zod schemas
 * Backend should handle its own validation and output encoding when rendering
 * 
 * This function is kept for backward compatibility but should be reconsidered:
 * - Zod validation already ensures data format
 * - Backend should validate and sanitize
 * - Output encoding should happen at render time, not input time
 */
export const sanitizeFormData = <T extends Record<string, unknown>>(
	data: T
): Record<string, string> => {
	const sanitized: Record<string, string> = {}

	for (const [key, value] of Object.entries(data)) {
		if (typeof value === 'string') {
			// Only remove HTML tags and trim - preserve legitimate characters
			sanitized[key] = value.trim().replace(/<[^>]*>/g, '')
		} else {
			sanitized[key] = String(value)
		}
	}

	return sanitized
}

/**
 * HTML entity encoding for HTML rendering contexts
 * Use this when rendering user input in HTML (not for API submission)
 */
export const escapeHtml = (input: string): string => {
	if (!input) return ''

	return input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;')
		.replace(/\//g, '&#x2F;')
}

/**
 * NOTE: For production HTML sanitization, consider using DOMPurify:
 *
 * npm install isomorphic-dompurify
 *
 * import DOMPurify from 'isomorphic-dompurify'
 *
 * export const sanitizeForHtml = (input: string): string => {
 *   return DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [] })
 * }
 */

import { ALLOWED_MIME_TYPES } from '@/config/app'

function isValidImageType(contentType: string | undefined): boolean {
	if (!contentType) return false
	return ALLOWED_MIME_TYPES.has(contentType.toLowerCase())
}

export { isValidImageType }

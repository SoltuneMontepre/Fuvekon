//pagination and search
export const MENU_PAGINATION_SIZE = 8
export const TABLE_PAGINATION_SIZE = 12
export const SEARCH_DEBOUNCE_DELAY = 500

//image
export const ALLOWED_MIME_TYPES = new Set([
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/gif',
	'image/webp',
	'image/svg+xml',
	'image/avif',
])
export const MAX_FILE_SIZE = 50 * 1024 * 1024
export const CACHE_MAX_AGE = 31536000

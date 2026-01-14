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

export const GOH_DETAILS = {
	first: {
		name: 'name_is_here_1',
		description: 'description_is_here_1',
		image: '/images/landing/goh-image-1.png',
	},
	second: {
		name: 'name_is_here_2',
		description: 'description_is_here_2',
		image: '/images/landing/goh-image-2.png',
	},
}

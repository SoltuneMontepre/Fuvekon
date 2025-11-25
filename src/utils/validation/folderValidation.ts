export interface ValidationResult {
	isValid: boolean
	error?: string
}

export function validateFolder(folder: string): ValidationResult {
	if (
		folder.includes('..') ||
		folder.includes('/') ||
		folder.includes('\\') ||
		folder.startsWith('.')
	) {
		return {
			isValid: false,
			error: 'Invalid folder parameter: path traversal detected',
		}
	}

	if (!/^[a-zA-Z0-9._-]+$/.test(folder)) {
		return {
			isValid: false,
			error: 'Invalid folder parameter: contains invalid characters',
		}
	}

	return { isValid: true }
}

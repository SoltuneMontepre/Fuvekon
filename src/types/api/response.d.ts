/**
 * Generic API Response wrapper
 * Used to wrap all API responses from the backend
 */
export interface ApiResponse<T = unknown> {
	isSuccess: boolean
	message: string
	/** i18n key for error message (e.g. "invalidEmailOrPassword"); only set on error responses */
	errorMessage?: string
	errorCode?: string
	data: T
	meta?: unknown // Optional metadata (e.g., pagination info)
	statusCode: number
}

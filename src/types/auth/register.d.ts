/**
 * Registration form data types
 */
export interface RegisterFormData {
	fullName: string
	nickname: string
	email: string
	country: string
	idCard: string
	password: string
	confirmPassword: string
}

/**
 * Form validation errors
 */
export interface FormErrors {
	fullName?: string
	nickname?: string
	email?: string
	country?: string
	idCard?: string
	password?: string
	confirmPassword?: string
	general?: string
}

/**
 * Registration API request
 */
export interface RegisterRequest {
	fullName: string
	nickname: string
	email: string
	country: string
	idCard: string
	password: string
	confirmPassword: string
}

/**
 * Registration API response
 */
export interface RegisterResponse {
	isSuccess: boolean
	message: string
	data?: {
		userId: string
		email: string
	}
}

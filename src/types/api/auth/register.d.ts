import type { ApiResponse } from '../response'

export interface RegisterRequest {
	fullName: string
	nickname: string
	email: string
	dateOfBirth: string
	country: string
	password: string
	confirmPassword: string
}

export interface RegisterData {
	userId: string
	email: string
}

/** Standard backend envelope: success flag + message + statusCode + data */
export type RegisterResponse = ApiResponse<RegisterData | null>

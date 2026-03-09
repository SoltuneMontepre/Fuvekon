export interface RegisterRequest {
	fullName: string
	nickname: string
	email: string
	dateOfBirth: string
	country: string
	password: string
	confirmPassword: string
}

export type RegisterResponse = {
	userId: string
	token: string
}

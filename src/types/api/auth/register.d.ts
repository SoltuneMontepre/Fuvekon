export interface RegisterRequest {
	fullName: string
	nickname: string
	email: string
	country: string
	idCard: string
	password: string
	confirmPassword: string
}

export type RegisterResponse = {
	userId: string
	token: string
}

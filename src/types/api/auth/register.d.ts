export interface RegisterRequest {
	fullName: string
	nickname: string
	email: string
	phone: string                // added during form expansion
	// dateOfBirth?: string      // uncomment if backend requires birth date
	country: string
	idCard: string
	password: string
	confirmPassword: string
}

export type RegisterResponse = {
	userId: string
	token: string
}

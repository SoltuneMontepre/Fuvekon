import type { Account } from '../../models/auth/account'

export interface RegisterRequest extends Account {
	email: string
	password: string
}

export type RegisterResponse = {
	userId: string
	token: string
}

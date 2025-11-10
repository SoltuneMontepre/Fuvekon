// Response types theo format của BE
export interface LoginData {
	access_token: string
}

export interface LoginResponse {
	isSuccess: boolean
	message: string
	data: LoginData
	statusCode: number
}
import { z } from 'zod'

// Request schema với Zod validation
export const LoginRequestSchema = z.object({
	email: z.email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>

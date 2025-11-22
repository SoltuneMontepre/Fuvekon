import { z } from 'zod'
import type { ApiResponse } from '../response'

// Response types
export interface LoginData {
	access_token: string
}

export type LoginResponse = ApiResponse<LoginData>

// Request schema with Zod validation
export const LoginRequestSchema = z.object({
	email: z.email('Invalid email address'),
	password: z.string(),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>

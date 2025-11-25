import type { ApiResponse } from '../response'

// Response types
export interface LogoutData {
	message: string
}

export type LogoutResponse = ApiResponse<LogoutData>

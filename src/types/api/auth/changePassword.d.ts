import type { ApiResponse } from '../response'

/**
 * Request payload for changing password (authenticated user)
 */
export interface ChangePasswordRequest {
	current_password: string
	new_password: string
	confirm_password: string
}

/**
 * Response from change password (no data)
 */
export type ChangePasswordResponse = ApiResponse<null>

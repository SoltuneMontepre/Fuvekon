import type { Account } from '../../models/auth/account'
import type { ApiResponse } from '../response'

/**
 * Request payload for updating user profile
 * All fields are optional for partial updates
 */
export interface UpdateMeRequest {
	fursona_name?: string
	first_name?: string
	last_name?: string
	country?: string
	identification_id?: string
	passport_id?: string
}

/**
 * Response from updating user profile
 * Returns the updated account data
 */
export type UpdateMeResponse = ApiResponse<Account>

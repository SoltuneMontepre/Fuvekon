import type { Account } from '../../models/auth/account'
import type { ApiResponse } from '../response'

/**
 * Request payload for updating user avatar
 */
export interface UpdateAvatarRequest {
	avatar: string
}

/**
 * Response from updating user avatar
 * Returns the updated account data
 */
export type UpdateAvatarResponse = ApiResponse<Account>

import type { Account } from '../../models/auth/account'
import type { ApiResponse } from '../response'

/**
 * Pagination metadata for paginated responses
 */
export interface PaginationMeta {
	currentPage: number
	pageSize: number
	totalPages: number
	totalItems: number
}

/**
 * Response from getting all users with pagination
 * Returns a paginated array of user accounts with metadata
 */
export interface GetAllUsersResponse
	extends Omit<ApiResponse<Account[]>, 'data'> {
	data: Account[]
	meta: PaginationMeta
}

/**
 * Query parameters for getting all users
 */
export interface GetAllUsersParams {
	page?: number
	pageSize?: number
}

/**
 * Response from getting a user by ID
 * Returns a single user account
 */
export type GetUserByIdResponse = ApiResponse<Account>

/**
 * Request payload for updating a user by admin
 * All fields are optional for partial updates
 */
export interface UpdateUserRequest {
	fursona_name?: string
	first_name?: string
	last_name?: string
	country?: string
	email?: string
	avatar?: string
	role?: string
	identification_id?: string
	passport_id?: string
	is_verified?: boolean
}

/**
 * Response from updating a user by admin
 * Returns the updated account data
 */
export type UpdateUserResponse = ApiResponse<Account>

/**
 * Response from deleting a user
 * Returns a success message
 */
export type DeleteUserResponse = ApiResponse<null>

/**
 * Response from verifying a user account
 * Returns the updated account data with verification status
 */
export type VerifyUserResponse = ApiResponse<Account>

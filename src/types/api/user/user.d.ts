import type { Account } from '../../models/auth/account'
import type { Role } from '../../models/auth/role'

// Admin user responses
// Backend returns: { data: Account[], meta: PaginationMeta }
// So AdminGetUsersResponse is just Account[] (the data field)
export type AdminGetUsersResponse = Account[]

export type GetUserByIdResponse = Account

// Admin update user request (PUT /admin/users/:id) - all fields optional
// Backend accepts role: User, Admin, Dealer (case-insensitive)
export interface AdminUpdateUserRequest {
	fursona_name?: string
	first_name?: string
	last_name?: string
	country?: string
	avatar?: string
	role?: Role | 'dealer'
	id_card?: string
	is_verified?: boolean
}

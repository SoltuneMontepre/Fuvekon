import type { Account } from '../../models/auth/account'

// Admin user responses
// Backend returns: { data: Account[], meta: PaginationMeta }
// So AdminGetUsersResponse is just Account[] (the data field)
export type AdminGetUsersResponse = Account[]

export type GetUserByIdResponse = Account

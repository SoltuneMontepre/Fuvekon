import type { Role } from './role'

export interface Account {
	id: string
	fursona_name?: string
	last_name?: string
	first_name?: string
	country?: string
	date_of_birth?: string // "YYYY-MM-DD"
	email: string
	avatar?: string // image url
	role: Role
	id_card?: string
	is_verified?: boolean
	is_dealer?: boolean
	is_blacklisted?: boolean
	/** Alias for is_blacklisted so FE can detect ban status from API */
	is_banned?: boolean
	is_has_ticket?: boolean
	denial_count?: number
	created_at?: string // ISO date string
	modified_at?: string // ISO date string
	deleted_at?: string | null // ISO date string, nullable
	is_deleted?: boolean
}

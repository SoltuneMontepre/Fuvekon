import type { Role } from './role'

export interface Account {
	id: string
	fursona_name?: string
	last_name?: string
	first_name?: string
	country?: string
	email: string
	avatar?: string // image url
	role: Role
	id_card?: string
	is_verified?: boolean
	is_dealer?: boolean
	is_blacklisted?: boolean
	is_has_ticket?: boolean
	denial_count?: number
	created_at?: string // ISO date string
	modified_at?: string // ISO date string
	deleted_at?: string | null // ISO date string, nullable
	is_deleted?: boolean
}

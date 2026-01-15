// Ticket Status enum matching backend
export type TicketStatus = 'pending' | 'self_confirmed' | 'approved' | 'denied'

// Ticket Tier - available ticket types
export interface TicketTier {
	id: string
	tier_code: string
	ticket_name: string
	description: string
	benefits: string[]
	price: number
	stock: number
	is_active: boolean
}

// User's ticket
export interface UserTicket {
	id: string
	reference_code: string
	status: TicketStatus
	ticket_number: number
	con_badge_name?: string
	badge_image?: string
	is_fursuiter: boolean
	is_fursuit_staff: boolean
	is_checked_in: boolean
	denial_reason?: string
	created_at: string
	approved_at?: string
	denied_at?: string
	tier?: TicketTier
	user?: TicketUser
}

// User info in ticket context (for admin)
export interface TicketUser {
	id: string
	email: string
	first_name: string
	last_name: string
	fursona_name: string
	denial_count: number
}

// Ticket Statistics
export interface TicketStatistics {
	total_tickets: number
	pending_count: number
	self_confirmed_count: number
	approved_count: number
	denied_count: number
	pending_over_24_hours: number
	tier_stats: TierStatistics[]
}

export interface TierStatistics {
	tier_id: string
	tier_code: string
	tier_name: string
	total_stock: number
	sold: number
	available: number
}

// Blacklisted User
export interface BlacklistedUser {
	id: string
	email: string
	first_name: string
	last_name: string
	fursona_name: string
	denial_count: number
	blacklisted_at?: string
	blacklist_reason: string
}

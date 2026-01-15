import type { TicketTier, UserTicket, TicketStatistics, BlacklistedUser } from '../../models/ticket/ticket'

// API Response types for tickets

export type GetTiersResponse = TicketTier[]

export type GetTierByIdResponse = TicketTier

export type GetMyTicketResponse = UserTicket | null

export type PurchaseTicketResponse = UserTicket

export type ConfirmPaymentResponse = UserTicket

export type UpdateBadgeDetailsResponse = UserTicket

// Admin responses
export interface AdminGetTicketsResponse {
	items: UserTicket[]
	meta: PaginationMeta
}

export type GetTicketByIdResponse = UserTicket

export type ApproveTicketResponse = UserTicket

export type DenyTicketResponse = UserTicket

export type GetTicketStatisticsResponse = TicketStatistics

export type GetBlacklistedUsersResponse = BlacklistedUser[]

// Pagination meta (for admin endpoints)
export interface PaginationMeta {
	currentPage: number
	pageSize: number
	totalPages: number
	totalItems: number
}

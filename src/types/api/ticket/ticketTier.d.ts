import type { TicketTier } from '../../models/ticket/ticketTier'

export type GetTicketTiersResponse = TicketTier[]

export type GetTicketTierByIdResponse = TicketTier

export type PurchaseTicketRequest = {
	ticketTierId: string
	quantity?: number
}

export type PurchaseTicketResponse = {
	success: boolean
	userTicketId?: string
	paymentId?: string
	message?: string
}


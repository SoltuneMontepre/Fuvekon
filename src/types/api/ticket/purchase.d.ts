import type { PaymentMethod } from '../../models/ticket/payment'

export interface PurchaseRequest {
	ticketId: string
	paymentMethod: PaymentMethod
}

export type PaymentMethod = 'credit_card' | 'paypal' | 'bank_transfer'

export type PaymentStatus =
	| 'pending'
	| 'paid'
	| 'cancelled'
	| 'failed'
	| 'expired'

export const PAYMENT_STATUS = {
	PENDING: 'pending' as PaymentStatus,
	PAID: 'paid' as PaymentStatus,
	CANCELLED: 'cancelled' as PaymentStatus,
	FAILED: 'failed' as PaymentStatus,
	EXPIRED: 'expired' as PaymentStatus,
} as const

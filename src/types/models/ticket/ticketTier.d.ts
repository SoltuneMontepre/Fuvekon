export interface TicketTier {
	id: string
	ticketName: string
	description: string
	price: number // Price in VNĐ
	stock: number
	isActive: boolean
	benefits: string[] // List of benefit descriptions
	bannerImage?: string // URL to banner image
	createdAt?: string
	updatedAt?: string
}


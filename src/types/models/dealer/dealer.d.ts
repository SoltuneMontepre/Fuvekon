// Dealer Staff
export interface DealerStaff {
	id: string
	user_id: string
	user_email: string
	user_name: string
	is_owner: boolean
	created_at: string
	modified_at: string
}

// Dealer Booth (basic response)
export interface DealerBooth {
	id: string
	booth_name: string
	description: string
	booth_number: string
	price_sheet: string
	is_verified: boolean
	created_at: string
	modified_at: string
}

// Dealer Booth Detail (includes staff)
export interface DealerBoothDetail extends DealerBooth {
	staffs?: DealerStaff[]
}

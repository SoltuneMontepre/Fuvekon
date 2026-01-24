import type { DealerBooth, DealerBoothDetail } from '../../../models/dealer/dealer'

// ========== Request Types ==========

export interface RegisterDealerRequest {
	booth_name: string
	description: string
	price_sheet: string
}

export interface JoinDealerRequest {
	booth_code: string
}

export interface RemoveStaffRequest {
	staff_user_id: string
}

// ========== Response Types ==========

export type RegisterDealerResponse = DealerBooth

export type JoinDealerResponse = DealerBoothDetail

export type RemoveStaffResponse = DealerBoothDetail

// Admin responses
// Backend returns: { data: DealerBoothDetail[], meta: PaginationMeta }
// So AdminGetDealersResponse is just DealerBoothDetail[] (the data field)
export type AdminGetDealersResponse = DealerBoothDetail[]

export type GetDealerByIdResponse = DealerBoothDetail

export type VerifyDealerResponse = DealerBoothDetail

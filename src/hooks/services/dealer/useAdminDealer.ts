'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { ApiResponse } from '@/types/api/response'
import type {
	AdminGetDealersResponse,
	GetDealerByIdResponse,
	VerifyDealerResponse,
} from '@/types/api/dealer/dealer'
import type { PaginationMeta } from '@/types/api/ticket/ticket'
import { getQueryClient } from '@/utils/getQueryClient'

// Admin filter params
export interface AdminDealerFilter {
	page?: number
	page_size?: number
	is_verified?: boolean
}

// Response type with meta at top level (matching backend structure)
interface AdminGetDealersResponseWithMeta extends ApiResponse<AdminGetDealersResponse> {
	meta?: PaginationMeta
}

// API Functions
const AdminDealerAPI = {
	// Get all dealers with pagination
	getDealers: async (filter: AdminDealerFilter = {}) => {
		const params = new URLSearchParams()
		if (filter.page) params.append('page', filter.page.toString())
		if (filter.page_size) params.append('page_size', filter.page_size.toString())
		if (filter.is_verified !== undefined) {
			params.append('is_verified', filter.is_verified.toString())
		}

		const queryString = params.toString()
		const url = `/admin/dealers${queryString ? `?${queryString}` : ''}`

		const { data } = await axios.general.get<AdminGetDealersResponseWithMeta>(url)
		return data
	},

	// Get dealer by ID
	getDealerById: async (dealerId: string) => {
		const { data } = await axios.general.get<ApiResponse<GetDealerByIdResponse>>(
			`/admin/dealers/${dealerId}`
		)
		return data
	},

	// Verify dealer
	verifyDealer: async (dealerId: string) => {
		const { data } = await axios.general.patch<ApiResponse<VerifyDealerResponse>>(
			`/admin/dealers/${dealerId}/verify`
		)
		return data
	},
}

// ========== Hooks ==========

// Get dealers for admin with pagination
export function useAdminGetDealers(filter: AdminDealerFilter = {}) {
	return useQuery({
		queryKey: ['admin-dealers', filter],
		queryFn: () => AdminDealerAPI.getDealers(filter),
		staleTime: 1000 * 30, // 30 seconds - admin needs fresh data
	})
}

// Get dealer by ID
export function useAdminGetDealerById(dealerId: string) {
	return useQuery({
		queryKey: ['admin-dealer', dealerId],
		queryFn: () => AdminDealerAPI.getDealerById(dealerId),
		enabled: !!dealerId,
	})
}

// Verify dealer mutation
export function useAdminVerifyDealer() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: (dealerId: string) => AdminDealerAPI.verifyDealer(dealerId),
		onSuccess: () => {
			// Invalidate dealer-related queries
			queryClient.invalidateQueries({ queryKey: ['admin-dealers'] })
			queryClient.invalidateQueries({ queryKey: ['admin-dealer'] })
		},
	})
}

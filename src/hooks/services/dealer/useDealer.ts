'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { ApiResponse } from '@/types/api/response'
import type {
	RegisterDealerRequest,
	RegisterDealerResponse,
	JoinDealerRequest,
	JoinDealerResponse,
	RemoveStaffRequest,
	RemoveStaffResponse,
	GetDealerByIdResponse,
} from '@/types/api/dealer/dealer'
import { getQueryClient } from '@/utils/getQueryClient'

// API Functions
const DealerAPI = {
	// Register as a dealer
	registerDealer: async (payload: RegisterDealerRequest) => {
		const { data } = await axios.general.post<ApiResponse<RegisterDealerResponse>>(
			'/dealer/register',
			payload
		)
		return data
	},

	// Join a dealer booth
	joinDealer: async (payload: JoinDealerRequest) => {
		const { data } = await axios.general.post<ApiResponse<JoinDealerResponse>>(
			'/dealer/join',
			payload
		)
		return data
	},

	// Remove staff from booth
	removeStaff: async (payload: RemoveStaffRequest) => {
		const { data } = await axios.general.delete<ApiResponse<RemoveStaffResponse>>(
			'/dealer/staff/remove',
			{
				data: payload,
			}
		)
		return data
	},

	// Get current user's dealer booth
	getMyDealer: async () => {
		const { data } = await axios.general.get<ApiResponse<GetDealerByIdResponse>>(
			'/dealer/me'
		)
		return data
	},
}

// ========== Hooks ==========

// Register as dealer mutation
export function useRegisterDealer() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: (payload: RegisterDealerRequest) => DealerAPI.registerDealer(payload),
		onSuccess: () => {
			// Invalidate dealer-related queries
			queryClient.invalidateQueries({ queryKey: ['dealer'] })
			queryClient.invalidateQueries({ queryKey: ['admin-dealers'] })
			// Invalidate account query to update is_dealer status
			queryClient.invalidateQueries({ queryKey: ['account'] })
		},
	})
}

// Join dealer booth mutation
export function useJoinDealer() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: (payload: JoinDealerRequest) => DealerAPI.joinDealer(payload),
		onSuccess: () => {
			// Invalidate dealer-related queries
			queryClient.invalidateQueries({ queryKey: ['dealer'] })
			queryClient.invalidateQueries({ queryKey: ['admin-dealers'] })
			// Invalidate account query to update is_dealer status
			queryClient.invalidateQueries({ queryKey: ['account'] })
		},
	})
}

// Remove staff from booth mutation
export function useRemoveStaff() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: (payload: RemoveStaffRequest) => DealerAPI.removeStaff(payload),
		onSuccess: () => {
			// Invalidate dealer-related queries
			queryClient.invalidateQueries({ queryKey: ['dealer'] })
			queryClient.invalidateQueries({ queryKey: ['admin-dealers'] })
		},
	})
}

// Get current user's dealer booth
export function useGetMyDealer(enabled: boolean = true) {
	return useQuery({
		queryKey: ['dealer', 'me'],
		queryFn: () => DealerAPI.getMyDealer(),
		retry: false, // Don't retry if user is not a dealer
		enabled, // Only enable query when user is a dealer
	})
}

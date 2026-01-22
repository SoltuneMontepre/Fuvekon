'use client'

import { useMutation } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { ApiResponse } from '@/types/api/response'
import type {
	RegisterDealerRequest,
	RegisterDealerResponse,
	JoinDealerRequest,
	JoinDealerResponse,
	RemoveStaffRequest,
	RemoveStaffResponse,
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

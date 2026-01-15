'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { ApiResponse } from '@/types/api/response'
import type {
	GetTiersResponse,
	GetTierByIdResponse,
	GetMyTicketResponse,
	PurchaseTicketResponse,
	ConfirmPaymentResponse,
	UpdateBadgeDetailsResponse,
} from '@/types/api/ticket/ticket'
import { getQueryClient } from '@/utils/getQueryClient'

// API Functions
const TicketAPI = {
	// Get all active tiers (public)
	getTiers: async () => {
		const { data } = await axios.general.get<ApiResponse<GetTiersResponse>>('/tickets/tiers')
		return data
	},

	// Get tier by ID (public)
	getTierById: async (tierId: string) => {
		const { data } = await axios.general.get<ApiResponse<GetTierByIdResponse>>(`/tickets/tiers/${tierId}`)
		return data
	},

	// Get current user's ticket (protected)
	getMyTicket: async () => {
		const { data } = await axios.general.get<ApiResponse<GetMyTicketResponse>>('/tickets/me')
		return data
	},

	// Purchase a ticket (protected)
	purchaseTicket: async (tierId: string) => {
		const { data } = await axios.general.post<ApiResponse<PurchaseTicketResponse>>('/tickets/purchase', {
			tier_id: tierId,
		})
		return data
	},

	// Confirm payment (protected)
	confirmPayment: async () => {
		const { data } = await axios.general.patch<ApiResponse<ConfirmPaymentResponse>>('/tickets/me/confirm')
		return data
	},

	// Update badge details (protected)
	updateBadgeDetails: async (payload: {
		con_badge_name: string
		badge_image?: string
		is_fursuiter: boolean
		is_fursuit_staff: boolean
	}) => {
		const { data } = await axios.general.patch<ApiResponse<UpdateBadgeDetailsResponse>>('/tickets/me/badge', payload)
		return data
	},

	// Cancel ticket (protected)
	cancelTicket: async () => {
		const { data } = await axios.general.delete<ApiResponse<Record<string, never>>>('/tickets/me/cancel')
		return data
	},
}

// ========== Hooks ==========

// Get all ticket tiers (public)
export function useGetTiers() {
	return useQuery({
		queryKey: ['ticket-tiers'],
		queryFn: () => TicketAPI.getTiers(),
		staleTime: 1000 * 60 * 5, // 5 minutes
	})
}

// Get tier by ID (public)
export function useGetTierById(tierId: string) {
	return useQuery({
		queryKey: ['ticket-tier', tierId],
		queryFn: () => TicketAPI.getTierById(tierId),
		enabled: !!tierId,
		staleTime: 1000 * 60 * 5,
	})
}

// Get current user's ticket
export function useGetMyTicket() {
	return useQuery({
		queryKey: ['my-ticket'],
		queryFn: () => TicketAPI.getMyTicket(),
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
	})
}

// Purchase ticket mutation
export function usePurchaseTicket() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: (tierId: string) => TicketAPI.purchaseTicket(tierId),
		onSuccess: () => {
			// Invalidate both my-ticket and tiers (stock changed)
			queryClient.invalidateQueries({ queryKey: ['my-ticket'] })
			queryClient.invalidateQueries({ queryKey: ['ticket-tiers'] })
		},
	})
}

// Confirm payment mutation
export function useConfirmPayment() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: () => TicketAPI.confirmPayment(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['my-ticket'] })
		},
	})
}

// Update badge details mutation
export function useUpdateBadgeDetails() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: (payload: {
			con_badge_name: string
			badge_image?: string
			is_fursuiter: boolean
			is_fursuit_staff: boolean
		}) => TicketAPI.updateBadgeDetails(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['my-ticket'] })
		},
	})
}

// Cancel ticket mutation
export function useCancelTicket() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: () => TicketAPI.cancelTicket(),
		onSuccess: () => {
			// Invalidate both my-ticket and tiers (stock will be re-incremented)
			queryClient.invalidateQueries({ queryKey: ['my-ticket'] })
			queryClient.invalidateQueries({ queryKey: ['ticket-tiers'] })
			queryClient.invalidateQueries({ queryKey: ['account'] })
		},
	})
}

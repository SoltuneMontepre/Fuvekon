'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { ApiResponse } from '@/types/api/response'
import type {
	AdminGetTicketsResponse,
	GetTicketByIdResponse,
	GetTierByIdResponse,
	ApproveTicketResponse,
	DenyTicketResponse,
	GetTicketStatisticsResponse,
	GetBlacklistedUsersResponse,
	PaginationMeta,
} from '@/types/api/ticket/ticket'
import { getQueryClient } from '@/utils/getQueryClient'

// Admin filter params
export interface AdminTicketFilter {
	status?: 'pending' | 'self_confirmed' | 'approved' | 'denied'
	tier_id?: string
	search?: string
	pending_over_24?: boolean
	page?: number
	page_size?: number
}

// API Functions
const AdminTicketAPI = {
	// Get all tickets with filters
	getTickets: async (filter: AdminTicketFilter = {}) => {
		const params = new URLSearchParams()
		if (filter.status) params.append('status', filter.status)
		if (filter.tier_id) params.append('tier_id', filter.tier_id)
		if (filter.search) params.append('search', filter.search)
		if (filter.pending_over_24) params.append('pending_over_24', 'true')
		if (filter.page) params.append('page', filter.page.toString())
		if (filter.page_size)
			params.append('page_size', filter.page_size.toString())

		const { data } = await axios.general.get<
			ApiResponse<AdminGetTicketsResponse>
		>(`/admin/tickets?${params.toString()}`)
		return data
	},

	// Get ticket statistics
	getStatistics: async () => {
		const { data } = await axios.general.get<
			ApiResponse<GetTicketStatisticsResponse>
		>('/admin/tickets/statistics')
		return data
	},

	// Get ticket by ID
	getTicketById: async (ticketId: string) => {
		const { data } = await axios.general.get<
			ApiResponse<GetTicketByIdResponse>
		>(`/admin/tickets/${ticketId}`)
		return data
	},

	// Approve ticket
	approveTicket: async (ticketId: string) => {
		const { data } = await axios.general.patch<
			ApiResponse<ApproveTicketResponse>
		>(`/admin/tickets/${ticketId}/approve`)
		return data
	},

	// Deny ticket
	denyTicket: async (ticketId: string, reason?: string) => {
		const { data } = await axios.general.patch<ApiResponse<DenyTicketResponse>>(
			`/admin/tickets/${ticketId}/deny`,
			{
				reason: reason || '',
			}
		)
		return data
	},

	// Create ticket for user (admin)
	createTicket: async (payload: { userId: string; tierId: string }) => {
		const { data } = await axios.general.post<
			ApiResponse<GetTicketByIdResponse>
		>('/admin/tickets', {
			user_id: payload.userId,
			tier_id: payload.tierId,
		})
		return data
	},

	// Get all tiers for admin (including inactive)
	getAdminTiers: async () => {
		const { data } = await axios.general.get<
			ApiResponse<GetTierByIdResponse[]>
		>('/admin/tickets/tiers')
		return data
	},

	// Create ticket tier (admin)
	createTier: async (payload: {
		ticket_name: string
		description?: string
		benefits?: string[]
		price: number
		stock: number
		is_active?: boolean
	}) => {
		const { data } = await axios.general.post<ApiResponse<GetTierByIdResponse>>(
			'/admin/tickets/tiers',
			payload
		)
		return data
	},

	// Update ticket tier (admin)
	updateTier: async (
		tierId: string,
		payload: {
			ticket_name?: string
			description?: string
			benefits?: string[]
			price?: number
			stock?: number
			is_active?: boolean
		}
	) => {
		const { data } = await axios.general.patch<
			ApiResponse<GetTierByIdResponse>
		>(`/admin/tickets/tiers/${tierId}`, payload)
		return data
	},

	// Delete ticket tier (admin)
	deleteTier: async (tierId: string) => {
		const { data } = await axios.general.delete<ApiResponse<null>>(
			`/admin/tickets/tiers/${tierId}`
		)
		return data
	},

	// Activate ticket tier (admin)
	activateTier: async (tierId: string) => {
		const { data } = await axios.general.patch<
			ApiResponse<GetTierByIdResponse>
		>(`/admin/tickets/tiers/${tierId}/activate`)
		return data
	},

	// Deactivate ticket tier (admin)
	deactivateTier: async (tierId: string) => {
		const { data } = await axios.general.patch<
			ApiResponse<GetTierByIdResponse>
		>(`/admin/tickets/tiers/${tierId}/deactivate`)
		return data
	},

	// Get blacklisted users
	getBlacklistedUsers: async (page = 1, pageSize = 20) => {
		const { data } = await axios.general.get<
			ApiResponse<GetBlacklistedUsersResponse> & { meta?: PaginationMeta }
		>(`/admin/users/blacklisted?page=${page}&page_size=${pageSize}`)
		return data
	},

	// Blacklist user
	blacklistUser: async (userId: string, reason: string) => {
		const { data } = await axios.general.patch<ApiResponse<null>>(
			`/admin/users/${userId}/blacklist`,
			{ reason }
		)
		return data
	},

	// Unblacklist user
	unblacklistUser: async (userId: string) => {
		const { data } = await axios.general.patch<ApiResponse<null>>(
			`/admin/users/${userId}/unblacklist`
		)
		return data
	},
}

// ========== Hooks ==========

// Get tickets for admin with filters
export function useAdminGetTickets(filter: AdminTicketFilter = {}) {
	return useQuery({
		queryKey: ['admin-tickets', filter],
		queryFn: () => AdminTicketAPI.getTickets(filter),
		staleTime: 1000 * 30, // 30 seconds - admin needs fresh data
	})
}

// Get ticket statistics
export function useGetTicketStatistics() {
	return useQuery({
		queryKey: ['ticket-statistics'],
		queryFn: () => AdminTicketAPI.getStatistics(),
		staleTime: 1000 * 60, // 1 minute
	})
}

// Get ticket by ID
export function useAdminGetTicketById(ticketId: string) {
	return useQuery({
		queryKey: ['admin-ticket', ticketId],
		queryFn: () => AdminTicketAPI.getTicketById(ticketId),
		enabled: !!ticketId,
	})
}

// Approve ticket mutation
export function useApproveTicket() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: (ticketId: string) => AdminTicketAPI.approveTicket(ticketId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
			queryClient.invalidateQueries({ queryKey: ['ticket-statistics'] })
		},
	})
}

// Deny ticket mutation
export function useDenyTicket() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: ({ ticketId, reason }: { ticketId: string; reason?: string }) =>
			AdminTicketAPI.denyTicket(ticketId, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
			queryClient.invalidateQueries({ queryKey: ['ticket-statistics'] })
			queryClient.invalidateQueries({ queryKey: ['ticket-tiers'] }) // Stock changed
		},
	})
}

// Create ticket for user (admin) mutation
export function useCreateTicket() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: (payload: { userId: string; tierId: string }) =>
			AdminTicketAPI.createTicket(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
			queryClient.invalidateQueries({ queryKey: ['ticket-statistics'] })
			queryClient.invalidateQueries({ queryKey: ['ticket-tiers'] })
		},
	})
}

// Get all tiers for admin (including inactive)
export function useAdminGetTiers() {
	return useQuery({
		queryKey: ['admin-tiers'],
		queryFn: () => AdminTicketAPI.getAdminTiers(),
		staleTime: 1000 * 30,
	})
}

// Create ticket tier (admin) mutation
export function useCreateTier() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: (payload: {
			ticket_name: string
			description?: string
			benefits?: string[]
			price: number
			stock: number
			is_active?: boolean
		}) => AdminTicketAPI.createTier(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['ticket-tiers'] })
			queryClient.invalidateQueries({ queryKey: ['admin-tiers'] })
			queryClient.invalidateQueries({ queryKey: ['ticket-statistics'] })
		},
	})
}

// Update ticket tier (admin) mutation
export function useUpdateTier() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: ({
			tierId,
			payload,
		}: {
			tierId: string
			payload: {
				ticket_name?: string
				description?: string
				benefits?: string[]
				price?: number
				stock?: number
				is_active?: boolean
			}
		}) => AdminTicketAPI.updateTier(tierId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['ticket-tiers'] })
			queryClient.invalidateQueries({ queryKey: ['admin-tiers'] })
			queryClient.invalidateQueries({ queryKey: ['ticket-statistics'] })
		},
	})
}

// Delete ticket tier (admin) mutation
export function useDeleteTier() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: (tierId: string) => AdminTicketAPI.deleteTier(tierId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['ticket-tiers'] })
			queryClient.invalidateQueries({ queryKey: ['admin-tiers'] })
			queryClient.invalidateQueries({ queryKey: ['ticket-statistics'] })
		},
	})
}

// Activate ticket tier (admin) mutation
export function useActivateTier() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: (tierId: string) => AdminTicketAPI.activateTier(tierId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['ticket-tiers'] })
			queryClient.invalidateQueries({ queryKey: ['admin-tiers'] })
			queryClient.invalidateQueries({ queryKey: ['ticket-statistics'] })
		},
	})
}

// Deactivate ticket tier (admin) mutation
export function useDeactivateTier() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: (tierId: string) => AdminTicketAPI.deactivateTier(tierId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['ticket-tiers'] })
			queryClient.invalidateQueries({ queryKey: ['admin-tiers'] })
			queryClient.invalidateQueries({ queryKey: ['ticket-statistics'] })
		},
	})
}

// Get blacklisted users
export function useGetBlacklistedUsers(page = 1, pageSize = 20) {
	return useQuery({
		queryKey: ['blacklisted-users', page, pageSize],
		queryFn: () => AdminTicketAPI.getBlacklistedUsers(page, pageSize),
	})
}

// Blacklist user mutation
export function useBlacklistUser() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
			AdminTicketAPI.blacklistUser(userId, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blacklisted-users'] })
		},
	})
}

// Unblacklist user mutation
export function useUnblacklistUser() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: (userId: string) => AdminTicketAPI.unblacklistUser(userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blacklisted-users'] })
		},
	})
}

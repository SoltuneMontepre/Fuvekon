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
	GetTicketSalesTimelineResponse,
	GetTicketRevenueResponse,
	GetBlacklistedUsersResponse,
	PaginationMeta,
} from '@/types/api/ticket/ticket'
import { getQueryClient } from '@/utils/getQueryClient'

// Admin filter params
export interface AdminTicketFilter {
	status?: 'pending' | 'self_confirmed' | 'approved' | 'denied' | 'admin_granted'
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

	// Get ticket sales timeline (count by day)
	getSalesTimeline: async (days = 90) => {
		const params = new URLSearchParams()
		params.append('days', days.toString())
		const { data } = await axios.general.get<
			ApiResponse<GetTicketSalesTimelineResponse>
		>(`/admin/tickets/statistics/timeline?${params.toString()}`)
		return data
	},

	// Get ticket revenue (total + optional by-day timeline)
	getRevenue: async (days = 0) => {
		const url =
			days > 0
				? `/admin/tickets/statistics/revenue?days=${days}`
				: '/admin/tickets/statistics/revenue'
		const { data } = await axios.general.get<
			ApiResponse<GetTicketRevenueResponse>
		>(url)
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

	// Confirm check-in (admin/staff). Accepts ticket ID or reference code.
	confirmCheckIn: async (ticketIdOrRef: string) => {
		const { data } = await axios.general.patch<
			ApiResponse<GetTicketByIdResponse>
		>(`/admin/tickets/${encodeURIComponent(ticketIdOrRef)}/check-in`)
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

	// Set tier visibility (admin) - show/hide in public listing
	setTierVisibility: async (tierId: string, visible: boolean) => {
		const { data } = await axios.general.patch<
			ApiResponse<GetTierByIdResponse>
		>(`/admin/tickets/tiers/${tierId}/visibility?visible=${visible}`)
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

	// Update ticket (admin back-door)
	updateTicket: async (
		ticketId: string,
		payload: {
			status?: string
			tier_id?: string
			con_badge_name?: string
			badge_image?: string
			is_fursuiter?: boolean
			is_fursuit_staff?: boolean
			is_checked_in?: boolean
			denial_reason?: string
		}
	) => {
		const { data } = await axios.general.patch<
			ApiResponse<GetTicketByIdResponse>
		>(`/admin/tickets/${ticketId}`, payload)
		return data
	},

	// Delete ticket (admin back-door - soft delete)
	deleteTicket: async (ticketId: string) => {
		const { data } = await axios.general.delete<
			ApiResponse<GetTicketByIdResponse>
		>(`/admin/tickets/${ticketId}`)
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

// Get ticket sales timeline (count by day)
export function useGetTicketSalesTimeline(days = 90) {
	return useQuery({
		queryKey: ['ticket-sales-timeline', days],
		queryFn: () => AdminTicketAPI.getSalesTimeline(days),
		staleTime: 1000 * 60 * 2, // 2 minutes
	})
}

// Get ticket revenue (total and optional by-day). Pass days=0 for total only.
export function useGetTicketRevenue(days = 90) {
	return useQuery({
		queryKey: ['ticket-revenue', days],
		queryFn: () => AdminTicketAPI.getRevenue(days),
		staleTime: 1000 * 60 * 2, // 2 minutes
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

// Confirm check-in mutation (admin/staff). Accepts ticket ID or reference code.
export function useConfirmCheckIn() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: (ticketIdOrRef: string) =>
			AdminTicketAPI.confirmCheckIn(ticketIdOrRef),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-ticket'] })
			queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
			queryClient.invalidateQueries({ queryKey: ['ticket-statistics'] })
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

// Set tier visibility (admin) mutation
export function useSetTierVisibility() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: ({ tierId, visible }: { tierId: string; visible: boolean }) =>
			AdminTicketAPI.setTierVisibility(tierId, visible),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['ticket-tiers'] })
			queryClient.invalidateQueries({ queryKey: ['admin-tiers'] })
			queryClient.invalidateQueries({ queryKey: ['ticket-statistics'] })
		},
	})
}

// Update ticket (admin back-door) mutation
export function useUpdateTicketForAdmin() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: ({
			ticketId,
			payload,
		}: {
			ticketId: string
			payload: {
				status?: string
				tier_id?: string
				con_badge_name?: string
				badge_image?: string
				is_fursuiter?: boolean
				is_fursuit_staff?: boolean
				is_checked_in?: boolean
				denial_reason?: string
			}
		}) => AdminTicketAPI.updateTicket(ticketId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
			queryClient.invalidateQueries({ queryKey: ['ticket-statistics'] })
			queryClient.invalidateQueries({ queryKey: ['ticket-tiers'] })
			queryClient.invalidateQueries({ queryKey: ['admin-tiers'] })
		},
	})
}

// Delete ticket (admin back-door) mutation
export function useDeleteTicketForAdmin() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: (ticketId: string) => AdminTicketAPI.deleteTicket(ticketId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
			queryClient.invalidateQueries({ queryKey: ['ticket-statistics'] })
			queryClient.invalidateQueries({ queryKey: ['ticket-tiers'] })
			queryClient.invalidateQueries({ queryKey: ['admin-tiers'] })
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
			queryClient.invalidateQueries({ queryKey: ['admin-users'] })
			queryClient.invalidateQueries({ queryKey: ['admin-user'] })
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
			queryClient.invalidateQueries({ queryKey: ['admin-users'] })
			queryClient.invalidateQueries({ queryKey: ['admin-user'] })
		},
	})
}

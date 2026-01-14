'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { ApiResponse } from '@/types/api/response'
import type {
	AdminGetTicketsResponse,
	GetTicketByIdResponse,
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
		if (filter.page_size) params.append('page_size', filter.page_size.toString())

		const { data } = await axios.general.get<ApiResponse<AdminGetTicketsResponse>>(
			`/admin/tickets?${params.toString()}`
		)
		return data
	},

	// Get ticket statistics
	getStatistics: async () => {
		const { data } = await axios.general.get<ApiResponse<GetTicketStatisticsResponse>>('/admin/tickets/statistics')
		return data
	},

	// Get ticket by ID
	getTicketById: async (ticketId: string) => {
		const { data } = await axios.general.get<ApiResponse<GetTicketByIdResponse>>(`/admin/tickets/${ticketId}`)
		return data
	},

	// Approve ticket
	approveTicket: async (ticketId: string) => {
		const { data } = await axios.general.patch<ApiResponse<ApproveTicketResponse>>(`/admin/tickets/${ticketId}/approve`)
		return data
	},

	// Deny ticket
	denyTicket: async (ticketId: string, reason?: string) => {
		const { data } = await axios.general.patch<ApiResponse<DenyTicketResponse>>(`/admin/tickets/${ticketId}/deny`, {
			reason: reason || '',
		})
		return data
	},

	// Get blacklisted users
	getBlacklistedUsers: async (page = 1, pageSize = 20) => {
		const { data } = await axios.general.get<ApiResponse<GetBlacklistedUsersResponse> & { meta?: PaginationMeta }>(
			`/admin/users/blacklisted?page=${page}&page_size=${pageSize}`
		)
		return data
	},

	// Blacklist user
	blacklistUser: async (userId: string, reason: string) => {
		const { data } = await axios.general.patch<ApiResponse<null>>(`/admin/users/${userId}/blacklist`, { reason })
		return data
	},

	// Unblacklist user
	unblacklistUser: async (userId: string) => {
		const { data } = await axios.general.patch<ApiResponse<null>>(`/admin/users/${userId}/unblacklist`)
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

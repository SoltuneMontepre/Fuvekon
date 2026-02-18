'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { ApiResponse } from '@/types/api/response'
import type {
	AdminGetUsersResponse,
	GetUserByIdResponse,
	AdminUpdateUserRequest,
} from '@/types/api/user/user'
import type { PaginationMeta } from '@/types/api/ticket/ticket'

// Admin filter params
export interface AdminUserFilter {
	page?: number
	pageSize?: number
}

// Response type with meta at top level (matching backend structure)
interface AdminGetUsersResponseWithMeta extends ApiResponse<AdminGetUsersResponse> {
	meta?: PaginationMeta
}

// API Functions
const AdminUserAPI = {
	// Get all users with pagination
	getUsers: async (filter: AdminUserFilter = {}) => {
		const params = new URLSearchParams()
		if (filter.page) params.append('page', filter.page.toString())
		if (filter.pageSize) params.append('pageSize', filter.pageSize.toString())

		const queryString = params.toString()
		const url = `/admin/users${queryString ? `?${queryString}` : ''}`
		
		const { data } = await axios.general.get<AdminGetUsersResponseWithMeta>(url)
		return data
	},

	// Get user by ID
	getUserById: async (userId: string) => {
		const { data } = await axios.general.get<ApiResponse<GetUserByIdResponse>>(`/admin/users/${userId}`)
		return data
	},

	// Update user by ID (admin)
	updateUserById: async (userId: string, payload: AdminUpdateUserRequest) => {
		const { data } = await axios.general.put<ApiResponse<GetUserByIdResponse>>(
			`/admin/users/${userId}`,
			payload
		)
		return data
	},
}

// ========== Hooks ==========

// Get users for admin with pagination
export function useAdminGetUsers(filter: AdminUserFilter = {}) {
	return useQuery({
		queryKey: ['admin-users', filter],
		queryFn: () => AdminUserAPI.getUsers(filter),
		staleTime: 1000 * 30, // 30 seconds - admin needs fresh data
	})
}

// Get user by ID
export function useAdminGetUserById(userId: string) {
	return useQuery({
		queryKey: ['admin-user', userId],
		queryFn: () => AdminUserAPI.getUserById(userId),
		enabled: !!userId,
	})
}

// Update user by ID (admin)
export function useAdminUpdateUser(userId: string) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: AdminUpdateUserRequest) =>
			AdminUserAPI.updateUserById(userId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-user', userId] })
			queryClient.invalidateQueries({ queryKey: ['admin-users'] })
		},
	})
}

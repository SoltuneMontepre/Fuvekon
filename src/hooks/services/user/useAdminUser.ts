'use client'

import { useMemo } from 'react'
import {
	useQuery,
	useMutation,
	useQueryClient,
	keepPreviousData,
	useQueries,
} from '@tanstack/react-query'
import axios from '@/common/axios'
import type { ApiResponse } from '@/types/api/response'
import type {
	AdminGetUsersResponse,
	GetUserByIdResponse,
	AdminUpdateUserRequest,
} from '@/types/api/user/user'
import type { PaginationMeta } from '@/types/api/ticket/ticket'

// Admin filter params (pagination + optional search)
export interface AdminUserFilter {
	page?: number
	pageSize?: number
	search?: string
}

// Response type with meta at top level (matching backend structure)
export interface AdminGetUsersResponseWithMeta extends ApiResponse<AdminGetUsersResponse> {
	meta?: PaginationMeta
}

// API Functions
const AdminUserAPI = {
	// Get all users with pagination and optional search
	getUsers: async (filter: AdminUserFilter = {}) => {
		const params = new URLSearchParams()
		if (filter.page != null) params.append('page', filter.page.toString())
		if (filter.pageSize != null) params.append('page_size', filter.pageSize.toString())
		if (filter.search?.trim()) params.append('search', filter.search.trim())

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
		placeholderData: keepPreviousData, // keep showing current page while fetching next
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

// Get multiple users by IDs and return a quick lookup map keyed by user id.
export function useAdminGetUsersByIds(userIds: string[]) {
	const uniqueIds = useMemo(
		() =>
			Array.from(
				new Set(userIds.filter(id => typeof id === 'string' && id.trim().length > 0))
			),
		[userIds]
	)

	const queryResults = useQueries({
		queries: uniqueIds.map(userId => ({
			queryKey: ['admin-user', userId],
			queryFn: () => AdminUserAPI.getUserById(userId),
		})),
	})

	const usersById = useMemo(
		() =>
			uniqueIds.reduce<Record<string, GetUserByIdResponse>>((acc, userId, index) => {
				const user = queryResults[index]?.data?.data
				if (user) {
					acc[userId] = user
				}
				return acc
			}, {}),
		[uniqueIds, queryResults]
	)

	return {
		usersById,
		isLoadingAny: queryResults.some(result => result.isLoading),
		isErrorAny: queryResults.some(result => result.isError),
	}
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

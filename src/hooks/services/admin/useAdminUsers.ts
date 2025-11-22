'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/common/axios'
import type {
	GetAllUsersResponse,
	GetAllUsersParams,
} from '@/types/api/admin/users'
import type { GetUserByIdResponse } from '@/types/api/admin/users'
import type {
	UpdateUserRequest,
	UpdateUserResponse,
} from '@/types/api/admin/users'
import type { DeleteUserResponse } from '@/types/api/admin/users'
import type { VerifyUserResponse } from '@/types/api/admin/users'

const AdminUsers = {
	getAllUsers: async (params?: GetAllUsersParams) => {
		const { data } = await axios.get<GetAllUsersResponse>('/admin/users', {
			params: {
				page: params?.page ?? 1,
				pageSize: params?.pageSize ?? 10,
			},
		})
		return data
	},
	getUserById: async (id: string) => {
		const { data } = await axios.get<GetUserByIdResponse>(`/admin/users/${id}`)
		return data
	},
	updateUser: async (id: string, payload: UpdateUserRequest) => {
		const { data } = await axios.put<UpdateUserResponse>(
			`/admin/users/${id}`,
			payload
		)
		return data
	},
	deleteUser: async (id: string) => {
		const { data } = await axios.delete<DeleteUserResponse>(
			`/admin/users/${id}`
		)
		return data
	},
	verifyUser: async (id: string) => {
		const { data } = await axios.patch<VerifyUserResponse>(
			`/admin/users/${id}/verify`
		)
		return data
	},
}

/**
 * Hook to get all users with pagination (admin only)
 * @param params - Pagination parameters (page, pageSize)
 */
export function useGetAllUsers(params?: GetAllUsersParams) {
	const page = params?.page ?? 1
	const pageSize = params?.pageSize ?? 10

	return useQuery<GetAllUsersResponse>({
		queryKey: ['admin', 'users', { page, pageSize }],
		queryFn: () => AdminUsers.getAllUsers(params),
		retry: false,
	})
}

/**
 * Hook to get a user by ID (admin only)
 */
export function useGetUserById(id: string) {
	return useQuery<GetUserByIdResponse>({
		queryKey: ['admin', 'users', id],
		queryFn: () => AdminUsers.getUserById(id),
		enabled: !!id,
		retry: false,
	})
}

/**
 * Hook to update a user by admin
 */
export function useUpdateUser() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			id,
			payload,
		}: {
			id: string
			payload: UpdateUserRequest
		}) => {
			return AdminUsers.updateUser(id, payload)
		},
		onSuccess: (data, variables) => {
			if (data.isSuccess) {
				// Invalidate and refetch all users queries (all pagination pages)
				queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
				// Invalidate specific user query
				queryClient.invalidateQueries({
					queryKey: ['admin', 'users', variables.id],
				})
			}
		},
		onError: (error: Error) => {
			console.error('Update user failed:', error.message)
		},
	})
}

/**
 * Hook to delete a user (admin only)
 */
export function useDeleteUser() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: string) => {
			return AdminUsers.deleteUser(id)
		},
		onSuccess: (data, id) => {
			if (data.isSuccess) {
				// Remove specific user query from cache
				queryClient.removeQueries({ queryKey: ['admin', 'users', id] })
				// Invalidate and refetch all users queries (all pagination pages)
				queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
			}
		},
		onError: (error: Error) => {
			console.error('Delete user failed:', error.message)
		},
	})
}

/**
 * Hook to verify a user account (admin only)
 */
export function useVerifyUser() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: string) => {
			return AdminUsers.verifyUser(id)
		},
		onSuccess: (data, id) => {
			if (data.isSuccess) {
				// Invalidate and refetch all users queries (all pagination pages)
				queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
				// Invalidate specific user query
				queryClient.invalidateQueries({
					queryKey: ['admin', 'users', id],
				})
			}
		},
		onError: (error: Error) => {
			console.error('Verify user failed:', error.message)
		},
	})
}

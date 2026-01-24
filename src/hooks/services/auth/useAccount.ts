'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { MeResponse } from '@/types/api/auth/me'
import type {
	UpdateMeRequest,
	UpdateMeResponse,
} from '@/types/api/auth/updateMe'
import type {
	UpdateAvatarRequest,
	UpdateAvatarResponse,
} from '@/types/api/auth/updateAvatar'
import { useAuthStore } from '@/stores/authStore'
import { getQueryClient } from '@/utils/getQueryClient'

const Account = {
	getMe: async () => {
		const { data } = await axios.general.get<MeResponse>('/users/me')
		return data
	},
	updateMe: async (payload: UpdateMeRequest) => {
		const { data } = await axios.general.put<UpdateMeResponse>(
			'/users/me',
			payload
		)
		return data
	},
	updateAvatar: async (payload: UpdateAvatarRequest) => {
		const { data } = await axios.general.patch<UpdateAvatarResponse>(
			'/users/me/avatar',
			payload
		)
		return data
	},
}

export function useGetMe() {
	const isAuthenticated = useAuthStore(state => state.isAuthenticated)

	return useQuery<MeResponse>({
		queryKey: ['account'],
		queryFn: () => Account.getMe(),
		enabled: isAuthenticated, // Only run query if user is authenticated
		retry: false,
		staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
		gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
		refetchOnWindowFocus: false, // Don't refetch on window focus
		refetchOnMount: false, // Don't refetch on component mount if data exists
		refetchOnReconnect: false, // Don't refetch on reconnect
	})
}

export function useUpdateMe() {
	const queryClient = getQueryClient()
	const setAccount = useAuthStore(state => state.setAccount)

	return useMutation({
		mutationFn: async (payload: UpdateMeRequest) => {
			return Account.updateMe(payload)
		},
		onSuccess: data => {
			if (data.isSuccess && data.data) {
				setAccount(data.data)
			}
			queryClient.invalidateQueries({ queryKey: ['account'] })
		},
	})
}

export function useUpdateAvatar() {
	const queryClient = getQueryClient()
	const setAccount = useAuthStore(state => state.setAccount)

	return useMutation({
		mutationFn: async (payload: UpdateAvatarRequest) => {
			return Account.updateAvatar(payload)
		},
		onSuccess: data => {
			if (data.isSuccess && data.data) {
				setAccount(data.data)
			}
			queryClient.invalidateQueries({ queryKey: ['account'] })
		},
	})
}

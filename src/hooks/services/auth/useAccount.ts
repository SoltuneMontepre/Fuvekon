'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type { MeResponse } from '@/types/api/auth/me'
import type {
	UpdateMeRequest,
	UpdateMeResponse,
} from '@/types/api/auth/updateMe'
import { useAuthStore } from '@/stores/authStore'

const Account = {
	getMe: async () => {
		const { data } = await axios.get<MeResponse>('/users/me')
		return data
	},
	updateMe: async (payload: UpdateMeRequest) => {
		const { data } = await axios.put<UpdateMeResponse>('/users/me', payload)
		return data
	},
}

export function useGetMe() {
	return useQuery<MeResponse>({
		queryKey: ['account'],
		queryFn: () => Account.getMe(),
		retry: false,
	})
}

export function useUpdateMe() {
	// const queryClient = useQueryClient()
	const setAccount = useAuthStore(state => state.setAccount)

	return useMutation({
		mutationFn: async (payload: UpdateMeRequest) => {
			return Account.updateMe(payload)
		},
		onSuccess: data => {
			if (data.isSuccess && data.data) {
				// Update the account in the store
				setAccount(data.data)
				// Invalidate and refetch the account query
				// queryClient.invalidateQueries({ queryKey: ['account'] })
			}
		},
		onError: (error: Error) => {
			console.error('Update account failed:', error.message)
		},
	})
}

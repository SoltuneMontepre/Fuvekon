'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type { LogoutResponse } from '@/types/api/auth/logout'
import { useAuthStore } from '@/stores/authStore'

export function useLogout() {
	const queryClient = useQueryClient()
	const clearAccount = useAuthStore(state => state.clearAccount)

	return useMutation({
		mutationFn: async () => {
			const { data } = await axios.post<LogoutResponse>('/auth/logout')
			return data
		},
		onSuccess: data => {
			queryClient.removeQueries({ queryKey: ['account'] })
			clearAccount()
			console.log('Logout successful:', data.message)
		},
		onError: (error: Error) => {
			console.error('Logout failed:', error.message)
		},
	})
}

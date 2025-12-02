'use client'

import { useMutation } from '@tanstack/react-query'
import type { LogoutResponse } from '@/types/api/auth/logout'
import { useAuthStore } from '@/stores/authStore'
import axios from '@/common/axios'
import { getQueryClient } from '@/utils/getQueryClient'

export function useLogout() {
	const queryClient = getQueryClient()
	const clearAccount = useAuthStore(state => state.clearAccount)

	return useMutation({
		mutationFn: async () => {
			const { data } = await axios.general.post<LogoutResponse>('/auth/logout')
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

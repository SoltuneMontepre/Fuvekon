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
			try {
				const { data } = await axios.general.post<LogoutResponse>('/auth/logout')
				return data
			} catch (error) {
				// If logout fails (401, etc.), still clear local state
				// The user should be logged out on frontend regardless
				return { message: 'Logged out locally', isSuccess: true }
			}
		},
		onSuccess: () => {
			queryClient.removeQueries({ queryKey: ['account'] })
			clearAccount()
		},
		onError: () => {
			// This should rarely happen now since we catch in mutationFn
			// Still clear local state on error
			queryClient.removeQueries({ queryKey: ['account'] })
			clearAccount()
		},
	})
}

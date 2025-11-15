'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/common/axios'
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
			// Clear account query cache after successful logout
			queryClient.invalidateQueries({ queryKey: ['account'] })
			// Clear auth store
			clearAccount()
			console.log('Logout successful:', data.message)
			// Optionally redirect or update application state here
		},
		onError: (error: Error) => {
			console.error('Logout failed:', error.message)
		},
	})
}

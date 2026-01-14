'use client'

import { useMutation } from '@tanstack/react-query'
import type { LogoutResponse } from '@/types/api/auth/logout'
import { useAuthStore } from '@/stores/authStore'
import axios from '@/common/axios'
import { getQueryClient } from '@/utils/getQueryClient'
import { logger } from '@/utils/logger'

export function useLogout() {
	const queryClient = getQueryClient()
	const clearAccount = useAuthStore(state => state.clearAccount)

	return useMutation({
		mutationFn: async () => {
			logger.info('Logout initiated')
			try {
				const { data } = await axios.general.post<LogoutResponse>('/auth/logout')
				logger.info('Logout API call successful')
				return data
			} catch (error) {
				// If logout fails (401, etc.), still clear local state
				// The user should be logged out on frontend regardless
				logger.warn('Logout API call failed, clearing local state', { error })
				return { message: 'Logged out locally', isSuccess: true }
			}
		},
		onSuccess: () => {
			logger.info('Clearing account state after logout')
			queryClient.removeQueries({ queryKey: ['account'] })
			clearAccount()
		},
		onError: () => {
			// This should rarely happen now since we catch in mutationFn
			// Still clear local state on error
			logger.error('Logout mutation error, clearing account state')
			queryClient.removeQueries({ queryKey: ['account'] })
			clearAccount()
		},
	})
}

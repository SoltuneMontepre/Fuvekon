'use client'

import { useMutation } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { GoogleLoginResponse } from '@/types/api/auth/googleLogin'
import { useGetMe } from '@/hooks/services/auth/useAccount'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import { logger } from '@/utils/logger'

export function useGoogleLogin() {
	const router = useRouter()
	const { refetch: refetchMe } = useGetMe()
	const setAccount = useAuthStore(state => state.setAccount)

	return useMutation({
		mutationFn: async (credential: string) => {
			logger.debug('Google login attempt')
			const { data } = await axios.general.post<GoogleLoginResponse>(
				'/auth/google',
				{ credential }
			)
			return data
		},
		onSuccess: async data => {
			if (!data.isSuccess) {
				return
			}
			const maxRetries = 5
			let retryCount = 0

			const attemptFetchUser = async (): Promise<void> => {
				const { data: meData } = await refetchMe()

				if (meData?.isSuccess && meData.data) {
					setAccount(meData.data)
					const userRole = meData.data.role?.toLowerCase()
					if (userRole === 'admin' || userRole === 'staff') {
						router.push('/admin/tickets')
					} else {
						router.push('/account')
					}
					return
				}

				retryCount++
				if (retryCount < maxRetries) {
					await new Promise(resolve => setTimeout(resolve, 50 * retryCount))
					return attemptFetchUser()
				}
				router.push('/account')
			}

			await attemptFetchUser()
		},
	})
}

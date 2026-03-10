'use client'

import { useMutation } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { GoogleLoginResponse } from '@/types/api/auth/googleLogin'
import type { GoogleRegisterRequest } from '@/types/api/auth/googleRegister'
import { useGetMe } from '@/hooks/services/auth/useAccount'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import { logger } from '@/utils/logger'

const GOOGLE_CREDENTIAL_KEY = 'google_register_credential'

export function storeGoogleCredential(credential: string) {
	sessionStorage.setItem(GOOGLE_CREDENTIAL_KEY, credential)
}

export function getGoogleCredential(): string | null {
	return sessionStorage.getItem(GOOGLE_CREDENTIAL_KEY)
}

export function clearGoogleCredential() {
	sessionStorage.removeItem(GOOGLE_CREDENTIAL_KEY)
}

export function useGoogleRegister() {
	const router = useRouter()
	const { refetch: refetchMe } = useGetMe()
	const setAccount = useAuthStore(state => state.setAccount)

	return useMutation({
		mutationFn: async (payload: GoogleRegisterRequest) => {
			logger.debug('Google register attempt')
			const { data } = await axios.general.post<GoogleLoginResponse>(
				'/auth/google',
				payload
			)
			return data
		},
		onSuccess: async data => {
			if (!data.isSuccess) {
				return
			}

			clearGoogleCredential()

			const maxRetries = 5
			let retryCount = 0

			const attemptFetchUser = async (): Promise<void> => {
				const { data: meData } = await refetchMe()

				if (meData?.isSuccess && meData.data) {
					setAccount(meData.data)
					router.push('/account')
					return
				}

				retryCount++
				if (retryCount < maxRetries) {
					await new Promise(resolve =>
						setTimeout(resolve, 50 * retryCount)
					)
					return attemptFetchUser()
				}
				router.push('/account')
			}

			await attemptFetchUser()
		},
	})
}

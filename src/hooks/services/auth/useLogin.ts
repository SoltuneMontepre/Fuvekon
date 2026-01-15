'use client'

import { useMutation } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { LoginResponse, LoginRequest } from '@/types/api/auth/login'
import { logger } from '@/utils/logger'

// Mask email to protect PII - shows first char and domain only
const maskEmail = (email: string): string => {
	const [local, domain] = email.split('@')
	if (!local || !domain) return '***'
	return `${local.charAt(0)}***@${domain}`
}

export function useLogin() {
	return useMutation({
		mutationFn: async (payload: LoginRequest) => {
			logger.debug('Login attempt', { email: maskEmail(payload.email) })
			const { data } = await axios.general.post<LoginResponse>(
				'/auth/login',
				payload
			)
			if (data.isSuccess) {
				logger.debug('Login successful', { email: maskEmail(payload.email) })
			} else {
				logger.warn('Login failed', { email: maskEmail(payload.email), message: data.message })
			}
			return data
		},
	})
}

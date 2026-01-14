'use client'

import { useMutation } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { LoginResponse, LoginRequest } from '@/types/api/auth/login'
import { logger } from '@/utils/logger'

export function useLogin() {
	return useMutation({
		mutationFn: async (payload: LoginRequest) => {
			logger.info('Login attempt', { email: payload.email })
			const { data } = await axios.general.post<LoginResponse>(
				'/auth/login',
				payload
			)
			if (data.isSuccess) {
				logger.info('Login successful', { email: payload.email })
			} else {
				logger.warn('Login failed', { email: payload.email, message: data.message })
			}
			return data
		},
	})
}

'use client'

import { useMutation } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { VerifyOtpRequest, VerifyOtpResponse } from '@/types/auth/verifyOtp'
// import { logger } from '@/utils/logger'

export function useVerifyOtp() {
	return useMutation({
		mutationFn: async (payload: VerifyOtpRequest) => {
			// logger.debug('Verify OTP attempt', { email: payload.email })
			const { data } = await axios.general.post<VerifyOtpResponse>(
				'/auth/verify-otp',
				payload
			)
			return data
		},
	})
}

import { z } from 'zod'
import { ERROR_MESSAGES } from '@/utils/validation/registerValidation.constants'

// Form schema for verifying OTP
export const VerifyOtpSchema = z.object({
	email: z
		.string()
		.min(1, ERROR_MESSAGES.REQUIRED_FIELD)
		.email(ERROR_MESSAGES.INVALID_EMAIL),
	otp: z.string().min(1, ERROR_MESSAGES.REQUIRED_FIELD),
})

export type VerifyOtpFormData = z.infer<typeof VerifyOtpSchema>

export const mapVerifyOtpToApiRequest = (
	data: VerifyOtpFormData
): import('@/types/auth/verifyOtp').VerifyOtpRequest => ({
	email: data.email,
	otp: data.otp,
})

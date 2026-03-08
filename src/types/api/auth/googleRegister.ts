import { z } from 'zod'
import {
	FORM_CONSTANTS,
	VALIDATION_PATTERNS,
	ERROR_MESSAGES,
} from '@/utils/validation/registerValidation.constants'

export const GoogleRegisterFormSchema = z.object({
	fullName: z
		.string()
		.min(1, ERROR_MESSAGES.REQUIRED_FIELD)
		.trim()
		.min(FORM_CONSTANTS.MIN_NAME_LENGTH, ERROR_MESSAGES.NAME_TOO_SHORT)
		.max(FORM_CONSTANTS.MAX_NAME_LENGTH, ERROR_MESSAGES.NAME_TOO_LONG)
		.regex(VALIDATION_PATTERNS.NAME, ERROR_MESSAGES.INVALID_NAME),
	nickname: z
		.string()
		.min(1, ERROR_MESSAGES.REQUIRED_FIELD)
		.trim()
		.min(FORM_CONSTANTS.MIN_NICKNAME_LENGTH, ERROR_MESSAGES.NICKNAME_TOO_SHORT)
		.max(FORM_CONSTANTS.MAX_NICKNAME_LENGTH, ERROR_MESSAGES.NICKNAME_TOO_LONG),
	dateOfBirth: z
		.string()
		.min(1, ERROR_MESSAGES.REQUIRED_FIELD)
		.refine(date => {
			const birthDate = new Date(date)
			const today = new Date()
			const age = today.getFullYear() - birthDate.getFullYear()
			const monthDiff = today.getMonth() - birthDate.getMonth()
			if (
				monthDiff < 0 ||
				(monthDiff === 0 && today.getDate() < birthDate.getDate())
			) {
				return age - 1 >= 16
			}
			return age >= 16
		}, 'validation.ageRequirement'),
	country: z
		.string()
		.min(1, ERROR_MESSAGES.REQUIRED_FIELD)
		.trim()
		.min(2, ERROR_MESSAGES.INVALID_COUNTRY),
})

export type GoogleRegisterFormData = z.infer<typeof GoogleRegisterFormSchema>

export interface GoogleRegisterRequest {
	credential: string
	fullName: string
	nickname: string
	dateOfBirth: string
	country: string
}

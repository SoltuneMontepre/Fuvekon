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
		.max(FORM_CONSTANTS.MAX_NICKNAME_LENGTH, ERROR_MESSAGES.NICKNAME_TOO_LONG)
		.regex(VALIDATION_PATTERNS.NICKNAME, ERROR_MESSAGES.INVALID_NICKNAME),
	country: z
		.string()
		.min(1, ERROR_MESSAGES.REQUIRED_FIELD)
		.trim()
		.min(2, ERROR_MESSAGES.INVALID_COUNTRY),
	idCard: z
		.string()
		.min(1, ERROR_MESSAGES.REQUIRED_FIELD)
		.transform(val => val.replace(/\s/g, '').toUpperCase())
		.refine(
			val => VALIDATION_PATTERNS.ID_CARD.test(val),
			ERROR_MESSAGES.INVALID_ID_CARD
		),
})

export type GoogleRegisterFormData = z.infer<typeof GoogleRegisterFormSchema>

export interface GoogleRegisterRequest {
	credential: string
	fullName: string
	nickname: string
	country: string
	idCard: string
}

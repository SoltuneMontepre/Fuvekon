import { z } from 'zod'
import {
	FORM_CONSTANTS,
	VALIDATION_PATTERNS,
	ERROR_MESSAGES,
} from '@/utils/validation/registerValidation.constants'

// Register form schema with Zod validation
export const RegisterFormSchema = z
	.object({
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
			.min(
				FORM_CONSTANTS.MIN_NICKNAME_LENGTH,
				ERROR_MESSAGES.NICKNAME_TOO_SHORT
			)
			.max(FORM_CONSTANTS.MAX_NICKNAME_LENGTH, ERROR_MESSAGES.NICKNAME_TOO_LONG)
			.regex(VALIDATION_PATTERNS.NICKNAME, ERROR_MESSAGES.INVALID_NICKNAME),
		email: z
			.string()
			.min(1, ERROR_MESSAGES.REQUIRED_FIELD)
			.trim()
			.email(ERROR_MESSAGES.INVALID_EMAIL)
			.regex(VALIDATION_PATTERNS.EMAIL, ERROR_MESSAGES.INVALID_EMAIL),
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
		password: z
			.string()
			.min(1, ERROR_MESSAGES.REQUIRED_FIELD)
			.min(FORM_CONSTANTS.MIN_PASSWORD_LENGTH, ERROR_MESSAGES.WEAK_PASSWORD)
			.max(FORM_CONSTANTS.MAX_PASSWORD_LENGTH, ERROR_MESSAGES.PASSWORD_TOO_LONG)
			.regex(VALIDATION_PATTERNS.PASSWORD, ERROR_MESSAGES.WEAK_PASSWORD),
		confirmPassword: z.string().min(1, ERROR_MESSAGES.REQUIRED_FIELD),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: ERROR_MESSAGES.PASSWORD_MISMATCH,
		path: ['confirmPassword'],
	})

export type RegisterFormData = z.infer<typeof RegisterFormSchema>

// Client-side form input type (without confirmPassword)
export type RegisterFormInput = Omit<RegisterFormData, 'confirmPassword'>

/**
 * Map form data to API request format
 * Maps client-side form data to backend API contract
 */
export const mapRegisterFormToApiRequest = (
	formInput: RegisterFormInput,
	confirmPassword: string
): import('@/types/api/auth/register.d').RegisterRequest => {
	return {
		fullName: formInput.fullName,
		nickname: formInput.nickname,
		email: formInput.email,
		country: formInput.country,
		idCard: formInput.idCard,
		password: formInput.password,
		confirmPassword,
	}
}

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
			.max(FORM_CONSTANTS.MAX_NICKNAME_LENGTH, ERROR_MESSAGES.NICKNAME_TOO_LONG),
		email: z
			.string()
			.min(1, ERROR_MESSAGES.REQUIRED_FIELD)
			.trim()
			.email(ERROR_MESSAGES.INVALID_EMAIL)
			.regex(VALIDATION_PATTERNS.EMAIL, ERROR_MESSAGES.INVALID_EMAIL),
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
		password: z
			.string()
			.min(1, ERROR_MESSAGES.REQUIRED_FIELD)
			.min(FORM_CONSTANTS.MIN_PASSWORD_LENGTH, ERROR_MESSAGES.WEAK_PASSWORD)
			.max(FORM_CONSTANTS.MAX_PASSWORD_LENGTH, ERROR_MESSAGES.PASSWORD_TOO_LONG)
			.regex(VALIDATION_PATTERNS.PASSWORD, ERROR_MESSAGES.WEAK_PASSWORD),
		confirmPassword: z.string().min(1, ERROR_MESSAGES.REQUIRED_FIELD),
		termsAccepted: z.boolean().refine(val => val === true, {
			message: 'Bạn phải chấp nhận điều khoản và dịch vụ',
		}),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: ERROR_MESSAGES.PASSWORD_MISMATCH,
		path: ['confirmPassword'],
	})

export type RegisterFormData = z.infer<typeof RegisterFormSchema>

// Client-side form input type (without confirmPassword and termsAccepted)
export type RegisterFormInput = Omit<
	RegisterFormData,
	'confirmPassword' | 'termsAccepted'
>

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
		dateOfBirth: formInput.dateOfBirth,
		country: formInput.country,
		password: formInput.password,
		confirmPassword,
	}
}

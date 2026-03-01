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
		phone: z
			.string()
			.min(1, ERROR_MESSAGES.REQUIRED_FIELD)
			.trim()
			.regex(/^[0-9+\s\-()]+$/, 'validation.invalidPhone')
			.min(10, 'validation.phoneTooShort'),
		// dateOfBirth: z
		// 	.string()
		// 	.min(1, ERROR_MESSAGES.REQUIRED_FIELD)
		// 	.refine(date => {
		// 		const birthDate = new Date(date)
		// 		const today = new Date()
		// 		const age = today.getFullYear() - birthDate.getFullYear()
		// 		const monthDiff = today.getMonth() - birthDate.getMonth()
		// 		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		// 			return age - 1 >= 16 // Must be at least 16 years old
		// 		}
		// 		return age >= 16
		// 	}, 'Bạn phải ít nhất 16 tuổi'),
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
export type RegisterFormInput = Omit<RegisterFormData, 'confirmPassword' | 'termsAccepted'>

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
		phone: formInput.phone,
		// dateOfBirth: formInput.dateOfBirth,
		country: formInput.country,
		idCard: formInput.idCard,
		password: formInput.password,
		confirmPassword,
	}
}

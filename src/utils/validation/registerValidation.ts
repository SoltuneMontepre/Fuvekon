import { RegisterFormData, FormErrors } from '@/types/auth/register'
import {
	FORM_CONSTANTS,
	VALIDATION_PATTERNS,
	ERROR_MESSAGES,
} from './registerValidation.constants'

/**
 * Validate full name
 */
export const validateFullName = (fullName: string): string | undefined => {
	const trimmed = fullName.trim()

	if (!trimmed) {
		return ERROR_MESSAGES.REQUIRED_FIELD
	}

	if (trimmed.length < FORM_CONSTANTS.MIN_NAME_LENGTH) {
		return ERROR_MESSAGES.NAME_TOO_SHORT
	}

	if (trimmed.length > FORM_CONSTANTS.MAX_NAME_LENGTH) {
		return ERROR_MESSAGES.NAME_TOO_LONG
	}

	if (!VALIDATION_PATTERNS.NAME.test(trimmed)) {
		return ERROR_MESSAGES.INVALID_NAME
	}

	return undefined
}

/**
 * Validate nickname
 */
export const validateNickname = (nickname: string): string | undefined => {
	const trimmed = nickname.trim()

	if (!trimmed) {
		return ERROR_MESSAGES.REQUIRED_FIELD
	}

	if (trimmed.length < FORM_CONSTANTS.MIN_NICKNAME_LENGTH) {
		return ERROR_MESSAGES.NICKNAME_TOO_SHORT
	}

	if (trimmed.length > FORM_CONSTANTS.MAX_NICKNAME_LENGTH) {
		return ERROR_MESSAGES.NICKNAME_TOO_LONG
	}

	if (!VALIDATION_PATTERNS.NICKNAME.test(trimmed)) {
		return ERROR_MESSAGES.INVALID_NICKNAME
	}

	return undefined
}

/**
 * Validate email address
 */
export const validateEmail = (email: string): string | undefined => {
	const trimmed = email.trim()

	if (!trimmed) {
		return ERROR_MESSAGES.REQUIRED_FIELD
	}

	if (!VALIDATION_PATTERNS.EMAIL.test(trimmed)) {
		return ERROR_MESSAGES.INVALID_EMAIL
	}

	return undefined
}

/**
 * Validate country
 */
export const validateCountry = (country: string): string | undefined => {
	const trimmed = country.trim()

	if (!trimmed) {
		return ERROR_MESSAGES.REQUIRED_FIELD
	}

	if (trimmed.length < 2) {
		return ERROR_MESSAGES.INVALID_COUNTRY
	}

	return undefined
}

/**
 * Validate ID card (Passport/CCCD)
 */
export const validateIdCard = (idCard: string): string | undefined => {
	const cleaned = idCard.replace(/\s/g, '').toUpperCase()

	if (!cleaned) {
		return ERROR_MESSAGES.REQUIRED_FIELD
	}

	if (!VALIDATION_PATTERNS.ID_CARD.test(cleaned)) {
		return ERROR_MESSAGES.INVALID_ID_CARD
	}

	return undefined
}

/**
 * Validate password strength
 */
export const validatePassword = (password: string): string | undefined => {
	if (!password) {
		return ERROR_MESSAGES.REQUIRED_FIELD
	}

	if (password.length < FORM_CONSTANTS.MIN_PASSWORD_LENGTH) {
		return ERROR_MESSAGES.WEAK_PASSWORD
	}

	if (password.length > FORM_CONSTANTS.MAX_PASSWORD_LENGTH) {
		return ERROR_MESSAGES.PASSWORD_TOO_LONG
	}

	if (!VALIDATION_PATTERNS.PASSWORD.test(password)) {
		return ERROR_MESSAGES.WEAK_PASSWORD
	}

	return undefined
}

/**
 * Validate password confirmation
 */
export const validateConfirmPassword = (
	password: string,
	confirmPassword: string,
): string | undefined => {
	if (!confirmPassword) {
		return ERROR_MESSAGES.REQUIRED_FIELD
	}

	if (password !== confirmPassword) {
		return ERROR_MESSAGES.PASSWORD_MISMATCH
	}

	return undefined
}

/**
 * Calculate password strength score (0-5)
 */
export const calculatePasswordStrength = (password: string): number => {
	let strength = 0

	if (password.length >= 8) strength++
	if (password.length >= 12) strength++
	if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
	if (/\d/.test(password)) strength++
	if (/[^a-zA-Z0-9]/.test(password)) strength++

	return strength
}

/**
 * Get password strength label
 */
export const getPasswordStrengthLabel = (strength: number): string => {
	switch (strength) {
		case 0:
		case 1:
			return 'Rất yếu'
		case 2:
			return 'Yếu'
		case 3:
			return 'Trung bình'
		case 4:
			return 'Mạnh'
		case 5:
			return 'Rất mạnh'
		default:
			return ''
	}
}

/**
 * Get password strength color
 */
export const getPasswordStrengthColor = (strength: number): string => {
	switch (strength) {
		case 0:
		case 1:
			return 'text-red-600'
		case 2:
			return 'text-orange-600'
		case 3:
			return 'text-yellow-600'
		case 4:
			return 'text-green-600'
		case 5:
			return 'text-emerald-600'
		default:
			return ''
	}
}

/**
 * Validate entire registration form
 */
export const validateRegisterForm = (
	data: RegisterFormData,
): FormErrors => {
	const errors: FormErrors = {}

	const fullNameError = validateFullName(data.fullName)
	if (fullNameError) errors.fullName = fullNameError

	const nicknameError = validateNickname(data.nickname)
	if (nicknameError) errors.nickname = nicknameError

	const emailError = validateEmail(data.email)
	if (emailError) errors.email = emailError

	const countryError = validateCountry(data.country)
	if (countryError) errors.country = countryError

	const idCardError = validateIdCard(data.idCard)
	if (idCardError) errors.idCard = idCardError

	const passwordError = validatePassword(data.password)
	if (passwordError) errors.password = passwordError

	const confirmPasswordError = validateConfirmPassword(
		data.password,
		data.confirmPassword,
	)
	if (confirmPasswordError) errors.confirmPassword = confirmPasswordError

	return errors
}

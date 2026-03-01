/**
 * Form validation constants and rules
 */

export const FORM_CONSTANTS = {
	MIN_NAME_LENGTH: 2,
	MAX_NAME_LENGTH: 50,
	MIN_NICKNAME_LENGTH: 3,
	MAX_NICKNAME_LENGTH: 20,
	MIN_PASSWORD_LENGTH: 8,
	MAX_PASSWORD_LENGTH: 128,
	MIN_ID_CARD_LENGTH: 9,
	MAX_ID_CARD_LENGTH: 12,
} as const

export const VALIDATION_PATTERNS = {
	EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
	ID_CARD: /^[0-9A-Z]{9,12}$/,
	NAME: /^[a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF]+$/, // Letters, spaces, and Vietnamese characters
	NICKNAME: /^[a-zA-Z0-9_-]+$/, // Alphanumeric, underscore, hyphen
} as const

export const ERROR_MESSAGES = {
	REQUIRED_FIELD: 'validation.requiredField',
	INVALID_EMAIL: 'validation.invalidEmail',
	INVALID_NAME: 'validation.invalidName',
	NAME_TOO_SHORT: 'validation.nameTooShort',
	NAME_TOO_LONG: 'validation.nameTooLong',
	INVALID_NICKNAME: 'validation.invalidNickname',
	NICKNAME_TOO_SHORT: 'validation.nicknameTooShort',
	NICKNAME_TOO_LONG: 'validation.nicknameTooLong',
	WEAK_PASSWORD: 'validation.weakPassword',
	PASSWORD_TOO_LONG: 'validation.passwordTooLong',
	PASSWORD_MISMATCH: 'validation.passwordMismatch',
	INVALID_ID_CARD: 'validation.invalidIdCard',
	INVALID_COUNTRY: 'validation.invalidCountry',
	REGISTRATION_FAILED: 'registerFailed',
	NETWORK_ERROR: 'networkError',
} as const

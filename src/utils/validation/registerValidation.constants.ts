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
	REQUIRED_FIELD: 'Trường này là bắt buộc',
	INVALID_EMAIL: 'Email không hợp lệ',
	INVALID_NAME: 'Họ và tên chỉ được chứa chữ cái và khoảng trắng',
	NAME_TOO_SHORT: `Họ và tên phải có ít nhất ${FORM_CONSTANTS.MIN_NAME_LENGTH} ký tự`,
	NAME_TOO_LONG: `Họ và tên không được quá ${FORM_CONSTANTS.MAX_NAME_LENGTH} ký tự`,
	INVALID_NICKNAME: 'Biệt danh chỉ được chứa chữ cái, số, gạch ngang và gạch dưới',
	NICKNAME_TOO_SHORT: `Biệt danh phải có ít nhất ${FORM_CONSTANTS.MIN_NICKNAME_LENGTH} ký tự`,
	NICKNAME_TOO_LONG: `Biệt danh không được quá ${FORM_CONSTANTS.MAX_NICKNAME_LENGTH} ký tự`,
	WEAK_PASSWORD: `Mật khẩu phải có ít nhất ${FORM_CONSTANTS.MIN_PASSWORD_LENGTH} ký tự, bao gồm chữ hoa, chữ thường và số`,
	PASSWORD_TOO_LONG: `Mật khẩu không được quá ${FORM_CONSTANTS.MAX_PASSWORD_LENGTH} ký tự`,
	PASSWORD_MISMATCH: 'Mật khẩu không khớp',
	INVALID_ID_CARD: 'Passport ID/CCCD không hợp lệ (9-12 ký tự, chỉ chữ và số)',
	INVALID_COUNTRY: 'Vui lòng nhập tên quốc gia',
	REGISTRATION_FAILED: 'Đăng ký thất bại. Vui lòng thử lại.',
	NETWORK_ERROR: 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.',
} as const

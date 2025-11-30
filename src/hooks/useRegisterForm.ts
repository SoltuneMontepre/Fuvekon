import { useState, useCallback } from 'react'
import {
	RegisterFormData,
	FormErrors,
	RegisterRequest,
	RegisterResponse,
} from '@/types/auth/register'
import { validateRegisterForm } from '@/utils/validation/registerValidation'
import { sanitizeFormData } from '@/utils/sanitization'
import { ERROR_MESSAGES } from '@/utils/validation/registerValidation.constants'
import { axiosAuth } from '@/common/axios'

/**
 * Rate limiting state
 */
let attemptCount = 0
let lastAttemptTime = 0
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

/**
 * Check if rate limit is exceeded
 */
const checkRateLimit = (): { allowed: boolean; waitTime?: number } => {
	const now = Date.now()
	const timeSinceLastAttempt = now - lastAttemptTime

	// Reset counter after lockout duration
	if (timeSinceLastAttempt > LOCKOUT_DURATION) {
		attemptCount = 0
	}

	if (attemptCount >= MAX_ATTEMPTS) {
		const remainingWait = LOCKOUT_DURATION - timeSinceLastAttempt
		if (remainingWait > 0) {
			return { allowed: false, waitTime: Math.ceil(remainingWait / 1000 / 60) }
		}
		attemptCount = 0 // Reset after lockout
	}

	return { allowed: true }
}

/**
 * Custom hook for registration form management
 * Handles state, validation, submission, error handling, and rate limiting
 */
export const useRegisterForm = () => {
	const [formData, setFormData] = useState<RegisterFormData>({
		fullName: '',
		nickname: '',
		email: '',
		country: '',
		idCard: '',
		password: '',
		confirmPassword: '',
	})

	const [errors, setErrors] = useState<FormErrors>({})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSuccess, setIsSuccess] = useState(false)

	/**
	 * Handle input change with memoization
	 */
	const handleChange = useCallback(
		(field: keyof RegisterFormData, value: string) => {
			setFormData(prev => ({ ...prev, [field]: value }))

			// Clear error for this field when user starts typing
			if (errors[field]) {
				setErrors(prev => {
					const newErrors = { ...prev }
					delete newErrors[field]
					return newErrors
				})
			}
		},
		[errors]
	)

	/**
	 * Validate single field on blur
	 */
	const handleBlur = useCallback((field: keyof RegisterFormData) => {
		setFormData(prev => {
			const validationErrors = validateRegisterForm(prev)
			if (validationErrors[field]) {
				setErrors(prevErrors => ({
					...prevErrors,
					[field]: validationErrors[field],
				}))
			}
			return prev
		})
	}, [])

	/**
	 * Reset form to initial state
	 */
	const resetForm = useCallback(() => {
		setFormData({
			fullName: '',
			nickname: '',
			email: '',
			country: '',
			idCard: '',
			password: '',
			confirmPassword: '',
		})
		setErrors({})
		setIsSuccess(false)
	}, [])

	/**
	 * Handle form submission with proper error handling and rate limiting
	 */
	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault()
			console.log('Form submitted - handleSubmit called')

			// Check rate limiting
			const rateLimitCheck = checkRateLimit()
			if (!rateLimitCheck.allowed) {
				setErrors({
					general: `Quá nhiều lần thử. Vui lòng đợi ${rateLimitCheck.waitTime} phút.`,
				})
				return
			}

			// Increment attempt counter
			attemptCount++
			lastAttemptTime = Date.now()

			// Clear previous errors
			setErrors({})
			setIsSubmitting(true)

			try {
				// Validate form data
				const validationErrors = validateRegisterForm(formData)

				if (Object.keys(validationErrors).length > 0) {
					setErrors(validationErrors)
					setIsSubmitting(false)
					return
				}

				// CRITICAL: Sanitize all inputs before submission
				const sanitizedData = sanitizeFormData(formData)

				// Prepare registration request
				const requestData: RegisterRequest = sanitizedData as RegisterFormData

				// Call registration API
				console.log('Making API request to:', '/register', requestData)
				const response = await axiosAuth.post<RegisterResponse>(
					'/register',
					requestData
				)

				// Check response status
				if (!response.data.isSuccess) {
					setErrors({
						general:
							response.data.message || ERROR_MESSAGES.REGISTRATION_FAILED,
					})
					return
				}

				// SUCCESS: Registration successful
				setIsSuccess(true)

				// Reset attempt counter on success
				attemptCount = 0

				// Clear sensitive data from memory
				resetForm()

				// Optional: Redirect to login or dashboard
				// router.push('/login')
			} catch (error: unknown) {
				// Handle axios errors
				if (error && typeof error === 'object' && 'response' in error) {
					const axiosError = error as {
						response?: { data?: { message?: string }; status?: number }
						request?: unknown
						message?: string
						constructor?: { name?: string }
					}
					// Server responded with error status
					const errorMessage =
						axiosError.response?.data?.message ||
						ERROR_MESSAGES.REGISTRATION_FAILED
					setErrors({ general: errorMessage })

					// Log error for monitoring (but NOT user data)
					console.error('Registration error:', {
						timestamp: new Date().toISOString(),
						status: axiosError.response?.status,
						errorType: axiosError.constructor?.name || typeof error,
					})
				} else if (error && typeof error === 'object' && 'request' in error) {
					// Request made but no response received
					setErrors({ general: ERROR_MESSAGES.NETWORK_ERROR })
				} else if (error instanceof Error) {
					// Something else happened
					setErrors({ general: error.message })
				} else {
					setErrors({ general: ERROR_MESSAGES.REGISTRATION_FAILED })
				}
			} finally {
				setIsSubmitting(false)
			}
		},
		[formData, resetForm]
	)

	return {
		formData,
		errors,
		isSubmitting,
		isSuccess,
		handleChange,
		handleBlur,
		handleSubmit,
		resetForm,
	}
}

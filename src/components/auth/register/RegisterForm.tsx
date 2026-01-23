'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { lockScroll } from '@/utils/scrollLock'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
	RegisterFormSchema,
	type RegisterFormData,
	type RegisterFormInput,
	mapRegisterFormToApiRequest,
} from '@/types/api/auth/register'
import { FORM_STYLES } from './RegisterForm.styles'
import { FloatingLabelInput } from './FloatingLabelInput'
import { ValidationSpeechBubble } from './ValidationSpeechBubble'
import { sanitizeInput } from '@/utils/sanitization'
import {
	checkRateLimit,
	incrementAttemptCount,
	resetAttemptCount,
} from '@/utils/rateLimit'
import axios from '@/common/axios'
import type { RegisterResponse } from '@/types/auth/register'
import { ERROR_MESSAGES } from '@/utils/validation/registerValidation.constants'

const RegisterForm = (): React.ReactElement => {
	const [isSuccess, setIsSuccess] = useState(false)
	const router = useRouter()

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
		setError,
		reset,
	} = useForm<RegisterFormData>({
		resolver: zodResolver(RegisterFormSchema),
		defaultValues: {
			fullName: '',
			nickname: '',
			email: '',
			country: '',
			idCard: '',
			password: '',
			confirmPassword: '',
		},
	})

	useEffect(() => {
		const unlock = lockScroll()
		return () => {
			unlock()
		}
	}, [])

	const onSubmit = async (data: RegisterFormData) => {
		// Check rate limiting
		const rateLimitCheck = checkRateLimit()
		if (!rateLimitCheck.allowed) {
			setError('root', {
				type: 'manual',
				message: `Quá nhiều lần thử. Vui lòng đợi ${rateLimitCheck.waitTime} phút.`,
			})
			return
		}

		// Increment attempt counter
		incrementAttemptCount()

		try {
			// Sanitize non-password fields (defense-in-depth)
			// Note: Zod validation already ensures format and trims whitespace
			// Backend should handle its own validation and output encoding
			const formInput: RegisterFormInput = {
				fullName: sanitizeInput(data.fullName),
				nickname: sanitizeInput(data.nickname),
				email: data.email.trim().toLowerCase(), // Email-specific handling
				country: sanitizeInput(data.country),
				idCard: sanitizeInput(data.idCard),
				password: data.password, // NEVER sanitize password - preserve as-is
			}

			// Map form data to API request format
			const requestData = mapRegisterFormToApiRequest(formInput, data.confirmPassword)

			const response = await axios.general.post<RegisterResponse>(
				'/auth/register',
				requestData
			)

			// Check response status
			if (!response.data.isSuccess) {
				setError('root', {
					type: 'manual',
					message: response.data.message || ERROR_MESSAGES.REGISTRATION_FAILED,
				})
				return
			}

			// SUCCESS: Registration successful
			setIsSuccess(true)

			// Reset attempt counter on success
			resetAttemptCount()

			// Clear sensitive data from memory
			reset()

			// Redirect to login after showing success message
			setTimeout(() => {
				router.push('/login')
			}, 2000) // 2 second delay to show success message
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
				setError('root', {
					type: 'manual',
					message: errorMessage,
				})
			} else if (error && typeof error === 'object' && 'request' in error) {
				// Request made but no response received
				setError('root', {
					type: 'manual',
					message: ERROR_MESSAGES.NETWORK_ERROR,
				})
			} else if (error instanceof Error) {
				// Something else happened
				setError('root', {
					type: 'manual',
					message: error.message,
				})
			} else {
				setError('root', {
					type: 'manual',
					message: ERROR_MESSAGES.REGISTRATION_FAILED,
				})
			}
		}
	}

	// Collect all field errors for speech bubble
	const fieldErrors: Record<string, string | undefined> = {
		fullName: errors.fullName?.message,
		nickname: errors.nickname?.message,
		email: errors.email?.message,
		country: errors.country?.message,
		idCard: errors.idCard?.message,
		password: errors.password?.message,
		confirmPassword: errors.confirmPassword?.message,
	}

	return (
		<div className={`${FORM_STYLES.container.wrapper} relative`}>
			{/* Validation Speech Bubble - Moved here to escape stacking context */}
			<ValidationSpeechBubble errors={fieldErrors} />
			{/* Main Content Panel */}
			<div className={FORM_STYLES.container.panel}>
				{/* Left Side - Character Illustration (background tràn panel) */}
				<div className={FORM_STYLES.container.background}>
					<Image
						src='/images/landing/tranh full oc.webp'
						alt='Fantasy Character'
						fill
						className='object-cover object-[50%_15%] scale-y-150 scale-x-150 translate-x-[-450px] translate-y-[150px]'
						priority
					/>
				</div>
				<div className={FORM_STYLES.container.formPanel}>
					<div className={FORM_STYLES.container.formContent}>
						{/* Title */}
						<h3 className={FORM_STYLES.form.title}>Đăng ký</h3>

						{/* Success Message */}
						{isSuccess && (
							<div className='text-green-600 text-xs sm:text-sm text-center bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3'>
								Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...
							</div>
						)}

						{/* Form */}
						<form
							onSubmit={handleSubmit(onSubmit)}
							className={FORM_STYLES.form.wrapper}
						>
							{/* General Error Message */}
							{errors.root && (
								<div className={FORM_STYLES.error.message} role='alert'>
									{errors.root.message}
								</div>
							)}

							{/* Full Name Input */}
							<FloatingLabelInput
								id='fullName'
								name='fullName'
								control={control}
								type='text'
								label='Họ và tên:'
								placeholder='Họ và tên'
								required
								showError={false}
							/>

							{/* Nickname Input */}
							<FloatingLabelInput
								id='nickname'
								name='nickname'
								control={control}
								type='text'
								label='Biệt danh:'
								placeholder='Biệt danh'
								required
								showError={false}
							/>

							{/* Email Input */}
							<FloatingLabelInput
								id='email'
								name='email'
								control={control}
								type='email'
								label='Gmail:'
								placeholder='Gmail'
								required
								showError={false}
							/>

							{/* Country Input */}
							<FloatingLabelInput
								id='country'
								name='country'
								control={control}
								type='text'
								label='Quốc gia:'
								placeholder='Quốc gia'
								required
								showError={false}
							/>

							{/* ID Card Input */}
							<FloatingLabelInput
								id='idCard'
								name='idCard'
								control={control}
								type='text'
								label='Passport ID/ CCCD:'
								placeholder='Passport ID/ CCCD'
								required
								showError={false}
							/>

							{/* Password Input */}
							<FloatingLabelInput
								id='password'
								name='password'
								control={control}
								type='password'
								label='Mật khẩu:'
								placeholder='Mật khẩu'
								required
								showPasswordToggle
								showError={false}
							/>

							{/* Confirm Password Input */}
							<FloatingLabelInput
								id='confirmPassword'
								name='confirmPassword'
								control={control}
								type='password'
								label='Nhập lại mật khẩu:'
								placeholder='Nhập lại mật khẩu'
								required
								showPasswordToggle
								showError={false}
							/>

							{/* Submit Button */}
							<button
								type='submit'
								disabled={isSubmitting}
								className={`${FORM_STYLES.button.primary} ${
									isSubmitting ? FORM_STYLES.button.disabled : ''
								}`}
							>
								{isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
							</button>

							{/* Links */}
							<div className={FORM_STYLES.link.container}>
								<Link
									href='/login'
									className={`${FORM_STYLES.link.base} ${FORM_STYLES.link.bold}`}
								>
									Đăng nhập
								</Link>
								<span className={FORM_STYLES.link.separator}>|</span>
								<Link href='/forgot-password' className={FORM_STYLES.link.base}>
									Quên mật khẩu
								</Link>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	)
}

export default RegisterForm

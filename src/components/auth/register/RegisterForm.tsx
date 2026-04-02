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
import { CountrySelect } from './CountrySelect'
import { sanitizeInput } from '@/utils/sanitization'
import {
	checkRateLimit,
	incrementAttemptCount,
	resetAttemptCount,
} from '@/utils/rateLimit'
import axios from '@/common/axios'
import type { RegisterResponse } from '@/types/api/auth/register.d'
import { useTranslations } from 'next-intl'
import { useGoogleLogin } from '@/hooks/services/auth/useGoogleLogin'
import GoogleLoginButton from '@/components/auth/login/GoogleLoginButton'
import { storeGoogleCredential } from '@/hooks/services/auth/useGoogleRegister'

const RegisterForm = (): React.ReactElement => {
	const [isSuccess, setIsSuccess] = useState(false)
	const router = useRouter()
	const t = useTranslations('auth')
	const googleLoginMutation = useGoogleLogin()
	const hasGoogleClientId =
		typeof process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID === 'string' &&
		process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.length > 0

	// Backend sends errorMessage as i18n key; we translate it
	const getAuthErrorMessage = (
		errorMessage?: string,
		fallbackKey: string = 'registerFailed'
	): string => {
		if (errorMessage?.trim()) {
			try {
				const translated = t(errorMessage.trim())
				return translated !== errorMessage.trim() ? translated : t(fallbackKey)
			} catch {
				return t(fallbackKey)
			}
		}
		return t(fallbackKey)
	}

	const {
		control,
		handleSubmit,
		clearErrors,
		formState: { errors, isSubmitting },
		setError,
		reset,
		watch,
	} = useForm<RegisterFormData>({
		resolver: zodResolver(RegisterFormSchema),
		defaultValues: {
			fullName: '',
			nickname: '',
			email: '',
			dateOfBirth: '',
			country: '',
			password: '',
			confirmPassword: '',
			termsAccepted: false,
		},
	})

	// Watch the termsAccepted field to control button state
	const termsAccepted = watch('termsAccepted')

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
				dateOfBirth: data.dateOfBirth,
				country: sanitizeInput(data.country),
				password: data.password, // NEVER sanitize password - preserve as-is
			}

			// Map form data to API request format
			const requestData = mapRegisterFormToApiRequest(
				formInput,
				data.confirmPassword
			)

			const response = await axios.general.post<RegisterResponse>(
				'/auth/register',
				requestData
			)

			// Check response status
			if (!response.data.isSuccess) {
				setError('root', {
					type: 'manual',
					message: getAuthErrorMessage(response.data.errorMessage),
				})
				return
			}

			// SUCCESS: Registration successful
			setIsSuccess(true)

			// Reset attempt counter on success
			resetAttemptCount()

			// Clear sensitive data from memory
			reset()

			// Redirect to OTP verification page after showing success message
			setTimeout(() => {
				// store the email temporarily in sessionStorage instead of exposing it in the URL.
				try {
					if (typeof window !== 'undefined') {
						window.sessionStorage.setItem('registrationEmail', formInput.email)
					}
				} catch {
					// storage may fail in very restricted environments; ignore silently
				}
				router.push('/register/verify-otp')
			}, 2000) // 2 second delay to show success message
		} catch (error: unknown) {
			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as {
					response?: {
						data?: { errorMessage?: string; message?: string }
						status?: number
					}
					request?: unknown
					message?: string
				}
				const errorMessage = getAuthErrorMessage(
					axiosError.response?.data?.errorMessage
				)
				setError('root', { type: 'manual', message: errorMessage })
			} else if (error && typeof error === 'object' && 'request' in error) {
				setError('root', {
					type: 'manual',
					message: t('networkError'),
				})
			} else if (error instanceof Error) {
				setError('root', {
					type: 'manual',
					message: error.message,
				})
			} else {
				setError('root', {
					type: 'manual',
					message: t('registerFailed'),
				})
			}
		}
	}

	return (
		<div className={`${FORM_STYLES.container.wrapper} relative`}>
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
						<h3 className={FORM_STYLES.form.title}>{t('registerTitle')}</h3>

						{/* Success Message */}
						{isSuccess && (
							<div className='text-green-600 text-xs sm:text-sm text-center bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3'>
								{t('registerSuccess')}
							</div>
						)}
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
								label={t('fullName')}
								placeholder={t('fullName')}
								required
								translateError={t}
							/>

							{/* Nickname Input */}
							<FloatingLabelInput
								id='nickname'
								name='nickname'
								control={control}
								type='text'
								label={t('nickname')}
								placeholder={t('nickname')}
								translateError={t}
							/>

							{/* Email Input */}
							<FloatingLabelInput
								id='email'
								name='email'
								control={control}
								type='email'
								label={t('email')}
								placeholder={t('email')}
								translateError={t}
							/>

							{/* Date of Birth Input */}
							<FloatingLabelInput
								id='dateOfBirth'
								name='dateOfBirth'
								control={control}
								type='date'
								label={t('dateOfBirth')}
								placeholder={t('dateOfBirth')}
								required
								translateError={t}
							/>

							{/* Nationality input — single column matching other inputs */}
							<div className={FORM_STYLES.container.inputWrapper}>
								<CountrySelect
									id='country'
									name='country'
									control={control}
									label={t('country')}
									placeholder={t('selectCountry')}
									required
									translateError={t}
								/>
							</div>

							{/* Password Input */}
							<FloatingLabelInput
								id='password'
								name='password'
								control={control}
								type='password'
								label={t('password')}
								placeholder={t('password')}
								showPasswordToggle
								translateError={t}
							/>

							{/* Confirm Password Input */}
							<FloatingLabelInput
								id='confirmPassword'
								name='confirmPassword'
								control={control}
								type='password'
								label={t('confirmPassword')}
								placeholder={t('confirmPassword')}
								showPasswordToggle
								translateError={t}
							/>

							{/* Terms Checkbox */}
							<div className='flex items-center gap-1 py-2 justify-center w-full'>
								<input
									type='checkbox'
									id='termsAccepted'
									{...control.register('termsAccepted')}
									className='w-5 h-5 mt-0.5 rounded border-[#8C8C8C]/30 bg-[#E2EEE2] text-[#48715B] focus:ring-[#48715B]/30 focus:ring-2 cursor-pointer'
									aria-invalid={!!errors.termsAccepted}
									aria-describedby={
										errors.termsAccepted ? 'terms-error' : undefined
									}
								/>
								<label
									htmlFor='termsAccepted'
									className='underline text-xs sm:text-sm text-[#8C8C8C] cursor-pointer'
								>
									{t('termsAgreement')}{' '}
									<Link href='/tos' className='underline underline-offset-4'>
										Terms of Service
									</Link>
								</label>
							</div>
							{errors.termsAccepted && (
								<p
									id='terms-error'
									className={FORM_STYLES.error.fieldError}
									role='alert'
								>
									{t(errors.termsAccepted.message as string)}
								</p>
							)}

							{/* Submit Button */}
							<button
								type='submit'
								disabled={
									isSubmitting ||
									googleLoginMutation.isPending ||
									!termsAccepted
								}
								className={`${FORM_STYLES.button.primary} ${
									isSubmitting ||
									googleLoginMutation.isPending ||
									!termsAccepted
										? FORM_STYLES.button.disabled
										: ''
								}`}
							>
								{isSubmitting ? t('registering') : t('registerButton')}
							</button>

							{/* Google Sign-up */}
							{hasGoogleClientId && (
								<>
									<div className='flex items-center gap-2 w-full mt-0.5'>
										<span className='flex-1 h-px bg-[#8C8C8C]/30' aria-hidden />
										<span className='text-[#8C8C8C] text-sm'>
											{t('orContinueWith')}
										</span>
										<span className='flex-1 h-px bg-[#8C8C8C]/30' aria-hidden />
									</div>
									<div className='flex justify-center w-full mt-1 -mb-0'>
										<GoogleLoginButton
											onSuccess={credential => {
												clearErrors('root')
												googleLoginMutation.mutate(credential, {
													onError: err => {
														const data = (
															err as {
																response?: { data?: { errorMessage?: string } }
															}
														)?.response?.data
														if (
															data?.errorMessage ===
															'googleRegistrationDetailsRequired'
														) {
															storeGoogleCredential(credential)
															router.push('/register/google')
															return
														}
														setError('root', {
															type: 'manual',
															message: data?.errorMessage
																? getAuthErrorMessage(
																		data.errorMessage,
																		'googleLoginFailed'
																	)
																: t('googleLoginFailed'),
														})
													},
												})
											}}
											onError={() => {
												setError('root', {
													type: 'manual',
													message: t('googleLoginFailed'),
												})
											}}
											disabled={googleLoginMutation.isPending || isSubmitting}
										/>
									</div>
								</>
							)}

							{/* Links */}
							<div className={FORM_STYLES.link.container}>
								<Link
									href='/login'
									className={`${FORM_STYLES.link.base} ${FORM_STYLES.link.bold}`}
								>
									{t('login')}
								</Link>
								<span className={FORM_STYLES.link.separator}>|</span>
								<Link href='/forgot-password' className={FORM_STYLES.link.base}>
									{t('forgotPassword')}
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

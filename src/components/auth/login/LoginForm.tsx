'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { lockScroll } from '@/utils/scrollLock'
import Image from 'next/image'
import Link from 'next/link'
import { useLogin } from '@/hooks/services/auth/useLogin'
import { useGetMe } from '@/hooks/services/auth/useAccount'
import { useAuthStore } from '@/stores/authStore'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { LoginRequestSchema, type LoginRequest } from '@/types/api/auth/login'

const LoginForm = (): React.ReactElement => {
	const [showPassword, setShowPassword] = useState(false)

	const t = useTranslations('auth')
	const router = useRouter()
	const loginMutation = useLogin()
	const { refetch: refetchMe } = useGetMe()
	const setAccount = useAuthStore(state => state.setAccount)

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
		setError: setFormError,
	} = useForm<LoginRequest>({
		resolver: zodResolver(LoginRequestSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const emailValue = watch('email')
	const passwordValue = watch('password')

	useEffect(() => {
		const unlock = lockScroll()
		return () => {
			unlock()
		}
	}, [])

	// Backend sends errorMessage as i18n key (e.g. "invalidEmailOrPassword"); we translate it
	const getLoginErrorMessage = (errorMessage?: string): string => {
		if (errorMessage?.trim()) {
			try {
				const translated = t(errorMessage.trim())
				// If key was missing, next-intl may return the key; treat as fallback
				return translated !== errorMessage.trim() ? translated : t('loginFailed')
			} catch {
				return t('loginFailed')
			}
		}
		return t('loginFailed')
	}

	const onSubmit = async (data: LoginRequest) => {
		loginMutation.mutate(data, {
			onSuccess: async responseData => {
				if (responseData.isSuccess) {
					// Poll for user data to confirm session is established
					const maxRetries = 5
					let retryCount = 0

					const attemptFetchUser = async (): Promise<void> => {
						const { data: meData } = await refetchMe()

						if (meData?.isSuccess && meData.data) {
							// Update account store
							setAccount(meData.data)

							const userRole = meData.data.role?.toLowerCase()

							// Redirect based on role
							if (userRole === 'admin' || userRole === 'staff') {
								router.push('/admin/tickets')
							} else {
								router.push('/account')
							}
							return
						}

						// Retry if session not yet established
						retryCount++
						if (retryCount < maxRetries) {
							await new Promise(resolve => setTimeout(resolve, 50 * retryCount))
							return attemptFetchUser()
						}

						// Fallback to /account if we can't get user data after retries
						router.push('/account')
					}

					await attemptFetchUser()
				} else {
					const api = responseData as { errorMessage?: string }
					setFormError('root', {
						type: 'manual',
						message: getLoginErrorMessage(api.errorMessage),
					})
				}
			},
			onError: err => {
				const data = (err as { response?: { data?: { errorMessage?: string } } })?.response?.data
				setFormError('root', {
					type: 'manual',
					message: getLoginErrorMessage(data?.errorMessage ?? (err as Error).message),
				})
			},
		})
	}

	return (
		<div
			id='login-form-container'
			className='login-form-container relative pt-8 sm:pt-16 md:pt-32 w-full max-w-5xl min-h-[450px] md:min-h-screen h-auto'
			style={{ 'paddingTop': '20%' }}
		>
			{/* Main Content Panel */}
			<div
				id='login-panel'
				className='login-panel relative bg-[#E2EEE2] -translate-y-8 sm:-translate-y-16 md:-translate-y-25 rounded-2xl md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[450px] items-center justify-center md:justify-start'
			>
				{/* Left Side - Character Illustration (background tràn panel) */}
				<div
					id='login-illustration-container'
					className='login-illustration-container absolute inset-0 w-full h-full z-10 pointer-events-none select-none hidden md:block'
				>
					<Image
						src='/images/landing/tranh full oc.webp'
						alt='Fantasy Character' 
						fill
						className='login-illustration object-cover object-[50%_0%] scale-y-130 scale-x-130  translate-x-[-380px] translate-y-[-17px]'
						priority
					/>
				</div>
				<div
					id='login-form-wrapper'
					className='login-form-wrapper relative md:absolute md:top-0 md:right-0 md:bottom-0 md:my-auto w-full md:w-1/2 p-6 sm:p-8 md:p-6 flex flex-col justify-center z-40 rounded-2xl md:rounded-[32px] bg-[#E2EEE2] md:shadow-2xl'
				>
					<div className='login-form-content space-y-6 sm:space-y-8'>
						{/* Title */}
						<h1
							id='login-title'
							className='login-title text-3xl sm:text-4xl md:text-5xl font-bold text-[#48715B] text-center tracking-wide'
						>
							{t('loginTitle')}
						</h1>

						{/* Form */}
						<form
							id='login-form'
							className='login-form space-y-5 sm:space-y-6'
							onSubmit={handleSubmit(onSubmit)}
						>
							{/* Error Message */}
							{errors.root && (
								<div
									id='login-error-message'
									className='login-error-message text-red-600 text-xs sm:text-sm text-center bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3'
								>
									{errors.root.message}
								</div>
							)}

							{/* Email Input */}
							<div
								id='email-input-container'
								className='email-input-container relative w-full max-w-[360px] sm:w-96 mx-auto'
							>
								<input
									id='email-input'
									type='email'
									{...register('email')}
									aria-invalid={!!errors.email}
									aria-describedby={errors.email ? 'email-error' : undefined}
									className={`email-input block w-full px-3 py-2.5 sm:py-3 rounded-xl bg-[#E2EEE2] border text-[#8C8C8C] text-lg sm:text-xl font-normal placeholder-transparent focus:outline-none focus:border-[#48715B] focus:ring-0 shadow-none peer ${errors.email ? 'border-red-500' : 'border-[#8C8C8C]/30'
										}`}
									placeholder={t('email')}
								/>
								<label
									htmlFor='email-input'
									className={`email-label absolute left-3 top-2.5 sm:top-3 text-lg sm:text-xl font-normal text-[#8C8C8C]/70 bg-[#E2EEE2] px-1 transition-all duration-200 pointer-events-none ${emailValue
											? 'scale-70 -translate-y-8 sm:-translate-y-9'
											: 'peer-focus:scale-70 peer-focus:-translate-y-8 sm:peer-focus:-translate-y-9'
										}`}
									style={{ transformOrigin: 'left' }}
								>
									{t('email')}:
								</label>
								{errors.email && (
									<p
										id='email-error'
										className='email-error text-red-600 text-xs mt-0.5'
										role='alert'
									>
										{errors.email.message}
									</p>
								)}
							</div>

							{/* Password Input */}
							<div
								id='password-input-container'
								className='password-input-container relative w-full max-w-[360px] sm:w-96 mx-auto'
							>
								<input
									id='password-input'
									type={showPassword ? 'text' : 'password'}
									{...register('password')}
									className={`password-input block w-full px-3 py-2.5 sm:py-3 pr-12 rounded-xl bg-[#E2EEE2] border text-[#8C8C8C] text-lg sm:text-xl font-normal placeholder-transparent focus:outline-none focus:border-[#48715B] focus:ring-0 shadow-none peer ${errors.password ? 'border-red-500' : 'border-[#8C8C8C]/30'
										}`}
									placeholder={t('password')}
								/>
								<label
									htmlFor='password-input'
									className={`password-label absolute left-3 top-2.5 sm:top-3 text-lg sm:text-xl font-normal text-[#8C8C8C]/70 bg-[#E2EEE2] px-1 transition-all duration-200 pointer-events-none ${passwordValue
											? 'scale-70 -translate-y-8 sm:-translate-y-9'
											: 'peer-focus:scale-70 peer-focus:-translate-y-8 sm:peer-focus:-translate-y-9'
										}`}
									style={{ transformOrigin: 'left' }}
								>
									{t('password')}:
								</label>
								<button
									id='password-toggle-button'
									type='button'
									className='password-toggle-button absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-[#48715B] transition-colors duration-200 focus:outline-none'
									onClick={() => setShowPassword(!showPassword)}
									title={showPassword ? t('hidePassword') : t('showPassword')}
									aria-label={
										showPassword ? t('hidePassword') : t('showPassword')
									}
								>
									{showPassword ? (
										<svg
											id='password-hide-icon'
											className='password-hide-icon w-6 h-6'
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 24 24'
											strokeWidth={1.5}
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												d='M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88'
											/>
										</svg>
									) : (
										<svg
											id='password-show-icon'
											className='password-show-icon w-6 h-6'
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 24 24'
											strokeWidth={1.5}
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												d='M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z'
											/>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
											/>
										</svg>
									)}
								</button>
								{errors.password && (
									<p
										id='password-error'
										className='password-error text-red-600 text-xs mt-0.5'
										role='alert'
									>
										{errors.password.message}
									</p>
								)}
							</div>

							{/* Submit Button */}
							<button
								id='login-submit-button'
								type='submit'
								className='login-submit-button block mx-auto w-full max-w-[200px] sm:w-[200px] py-3 sm:py-3.5 rounded-xl text-[#48715B] font-semibold text-base sm:text-lg hover:bg-[#48715B]/90 hover:text-[#E2EEE2] active:bg-[#48715B]/80 focus:outline-none focus:ring-4 focus:ring-[#48715B]/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed'
								disabled={isSubmitting || loginMutation.isPending}
							>
								{isSubmitting || loginMutation.isPending
									? t('loggingIn')
									: t('login')}
							</button>

							{/* Links */}
							<div
								id='login-links-container'
								className='login-links-container flex items-center justify-center gap-2 text-xs sm:text-sm pt-2'
							>
								<Link
									id='register-link'
									href='/register'
									className='register-link text-[#8C8C8C] hover:text-[#48715B]/80 font-medium transition-colors duration-200 hover:underline'
								>
									{t('register')}
								</Link>
								<span className='link-separator text-[#8C8C8C]/60'>|</span>
								<Link
									id='forgot-password-link'
									href='/forgot-password'
									className='forgot-password-link text-[#8C8C8C] hover:text-[#48715B]/80 font-medium transition-colors duration-200 hover:underline'
								>
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

export default LoginForm

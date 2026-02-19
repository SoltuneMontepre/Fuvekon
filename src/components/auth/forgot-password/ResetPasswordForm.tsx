'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { lockScroll } from '@/utils/scrollLock'
import axios from '@/common/axios'
import { FORM_CONSTANTS, VALIDATION_PATTERNS, ERROR_MESSAGES } from '@/utils/validation/registerValidation.constants'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import AuthIllustration from '@/components/art/AuthIllustration'
import Link from 'next/link'

const ResetPasswordSchema = z
	.object({
		newPassword: z.string()
			.min(FORM_CONSTANTS.MIN_PASSWORD_LENGTH, ERROR_MESSAGES.WEAK_PASSWORD)
			.max(FORM_CONSTANTS.MAX_PASSWORD_LENGTH, ERROR_MESSAGES.PASSWORD_TOO_LONG)
			.regex(VALIDATION_PATTERNS.PASSWORD, ERROR_MESSAGES.WEAK_PASSWORD),
		confirmPassword: z.string().min(1, ERROR_MESSAGES.REQUIRED_FIELD),
		token: z.string().optional(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: ERROR_MESSAGES.PASSWORD_MISMATCH,
		path: ['confirmPassword'],
	})

type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>

const ResetPasswordForm = (): React.ReactElement => {
	const t = useTranslations('auth')
	const router = useRouter()
	const [isSuccess, setIsSuccess] = useState(false)
	const [initialToken, setInitialToken] = useState<string | null>(null)

	const getAuthErrorMessage = (errorMessage?: string, fallbackKey: string = 'resetPasswordConfirmFailed'): string => {
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
		register,
		setValue,
		handleSubmit,
		setError: setFormError,
		formState: { errors, isSubmitting },
		reset,
		watch,
	} = useForm<ResetPasswordFormData>({
		resolver: zodResolver(ResetPasswordSchema),
		defaultValues: { newPassword: '', confirmPassword: '', token: '' },
	})

	useEffect(() => {
		const unlock = lockScroll()
		return () => unlock()
	}, [])

	useEffect(() => {
		if (typeof window === 'undefined') return

		const extractToken = (str: string | null) => {
			if (!str) return null
			const jwtMatch = str.match(/([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/)
			if (jwtMatch && jwtMatch[1]) return jwtMatch[1]

			// // Fallback to token= capture (stop at &, whitespace)
			// const match = str.match(/token=([^&\\s]+)/)
			// if (match && match[1]) {
			// 	try {
			// 		return decodeURIComponent(match[1])
			// 	} catch (e) {
			// 		// Malformed encoding; return raw value instead of throwing
			// 		console.debug('ResetPassword - decodeURIComponent failed for token, using raw value', match[1])
			// 		return match[1]
			// 	}
			// }

			return null
		}

		const hash = window.location.hash
		let token: string | null = null
		if (hash) {
			token = extractToken(hash)
		}

		if (!token) {
			const params = new URLSearchParams(window.location.search)
			const q = params.get('token')
			if (q) token = q
		}

		if (token) {
			console.debug('ResetPassword - extracted token', token ? `${token.slice(0,6)}...${token.slice(-6)}` : null)
			setInitialToken(token)
		} else {
			console.debug('ResetPassword - no token found in URL')
		}
	}, [])

	useEffect(() => {
		if (initialToken) {
			setValue('token', initialToken)
		}
	}, [initialToken, setValue])

	const onSubmit = async (data: ResetPasswordFormData) => {
		try {
			const tokenToUse = initialToken || data.token
			if (!tokenToUse) {
				setFormError('root', { type: 'manual', message: 'No token found. Please use the link sent by email.' })
				setIsSuccess(false)
				return
			}
			const body = { token: tokenToUse, new_password: data.newPassword, confirm_password: data.confirmPassword }
			console.debug('ResetPassword - request', {
                //mask
				tokenPreview: tokenToUse ? `${tokenToUse.slice(0, 6)}...${tokenToUse.slice(-6)}` : null,
				newPasswordLength: data.newPassword ? data.newPassword.length : 0,
				confirmPasswordLength: data.confirmPassword ? data.confirmPassword.length : 0,
			})
			const response = await axios.general.post('/auth/reset-password/confirm', body)

			if (response?.data && !response.data.isSuccess) {
				setFormError('root', {
					type: 'manual',
					message: getAuthErrorMessage(response.data.errorMessage),
				})
				return
			}

			setIsSuccess(true)
			reset()
			setTimeout(() => router.push('/login'), 2000)
		} catch (err: unknown) {
			let message = t('networkError')
			if (err && typeof err === 'object' && 'response' in err) {
				const e = err as { response?: { status?: number; data?: { errorMessage?: string; message?: string } }; message?: string }
				console.debug('ResetPassword - error', e.response || e)
				message = e.response?.data?.errorMessage
					? getAuthErrorMessage(e.response.data.errorMessage)
					: (e.response?.data?.message || e.message || message)
			} else if (err instanceof Error) {
				message = err.message
			}
			setFormError('root', { type: 'manual', message })
			setIsSuccess(false)
		}
	}

	return (
		<div id='reset-form-container' className='reset-form-container relative pt-8 sm:pt-16 md:pt-32 w-full max-w-5xl min-h-[450px] md:min-h-screen h-auto' style={{ paddingTop: '20%' }}>
			<div id='reset-panel' className='reset-panel relative bg-[#E2EEE2] -translate-y-8 sm:-translate-y-16 md:-translate-y-25 rounded-2xl md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[450px] items-center justify-center md:justify-start'>			
                <AuthIllustration />				
                <div id='reset-form-wrapper' className='reset-form-wrapper relative md:absolute md:top-0 md:right-0 md:bottom-0 md:my-auto w-full md:w-1/2 p-6 sm:p-8 md:p-6 flex flex-col justify-center z-40 rounded-2xl md:rounded-[32px] bg-[#E2EEE2] md:shadow-2xl'>
					<div className='reset-form-content space-y-6 sm:space-y-8'>
						<h1 id='reset-title' className='reset-title text-3xl sm:text-4xl md:text-5xl font-bold text-[#48715B] text-center tracking-wide'>
                            Đổi mật khẩu
						</h1>

						{errors.root && (
							<div id='reset-error-message' className='text-red-600 text-xs sm:text-sm text-center bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3'>
								{errors.root.message}
							</div>
						)}

						{isSuccess && (
							<div className='text-green-600 text-xs sm:text-sm text-center bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3'>
								Mật khẩu của bạn đã được đặt lại thành công! Chuyển hướng đến trang đăng nhập...
							</div>
						)}

				<form id='reset-form' className='reset-form space-y-5 sm:space-y-6' onSubmit={handleSubmit(onSubmit)}>
					{initialToken ? (
						<input type='hidden' {...register('token')} />
					) : (
						<div className='token-input-container text-center'>
							{/* <label htmlFor='token-input' className='text-sm text-[#8C8C8C] mb-1 block'>Không tìm thấy token tự động — dán token từ email ở đây</label> */}
							<label htmlFor='token-input' className='text-sm text-[#8C8C8C] mb-1 block'></label>
							<input id='token-input' type='text' {...register('token')} className='input block w-full px-3 py-2.5 rounded-xl bg-[#E2EEE2] border text-[#8C8C8C] text-sm sm:text-base mx-auto max-w-[360px]' placeholder='Dán token tại đây' />
						</div>
					)}

							<div className='password-input-container relative w-full max-w-[360px] sm:w-96 mx-auto'>
								<input id='new-password' type='password' {...register('newPassword')} aria-invalid={!!errors.newPassword} className={`input block w-full px-3 py-2.5 sm:py-3 rounded-xl bg-[#E2EEE2] border text-[#8C8C8C] text-lg sm:text-xl font-normal focus:outline-none focus:border-[#48715B] focus:ring-0 shadow-none ${errors.newPassword ? 'border-red-500' : 'border-[#8C8C8C]/30'}`} placeholder='Mật khẩu mới' />
								{errors.newPassword && <p className='text-red-600 text-xs mt-0.5'>{errors.newPassword.message}</p>}
							</div>

							<div className='password-input-container relative w-full max-w-[360px] sm:w-96 mx-auto'>
								<input id='confirm-password' type='password' {...register('confirmPassword')} aria-invalid={!!errors.confirmPassword} className={`input block w-full px-3 py-2.5 sm:py-3 rounded-xl bg-[#E2EEE2] border text-[#8C8C8C] text-lg sm:text-xl font-normal focus:outline-none focus:border-[#48715B] focus:ring-0 shadow-none ${errors.confirmPassword ? 'border-red-500' : 'border-[#8C8C8C]/30'}`} placeholder='Xác nhận mật khẩu mới' />
								{errors.confirmPassword && <p className='text-red-600 text-xs mt-0.5'>{errors.confirmPassword.message}</p>}
							</div>

							<button id='reset-submit-button' type='submit' className='reset-submit-button block mx-auto w-full max-w-[200px] sm:w-[200px] py-3 sm:py-3.5 rounded-xl text-[#48715B] font-semibold text-base sm:text-lg hover:bg-[#48715B]/90 hover:text-[#E2EEE2] active:bg-[#48715B]/80 focus:outline-none focus:ring-4 focus:ring-[#48715B]/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed' disabled={isSubmitting || !(initialToken || watch('token'))}>
								{isSubmitting ? 'Đang đổi...' : 'Xác nhận'}
							</button>

							<div className='links-container flex items-center justify-center gap-2 text-xs sm:text-sm pt-2'>
								<Link href='/login' className='text-[#8C8C8C] hover:text-[#48715B]/80 font-medium transition-colors duration-200 hover:underline'>
									Trở về trang Login
								</Link>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ResetPasswordForm

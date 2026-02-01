'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { lockScroll } from '@/utils/scrollLock'
import axios from '@/common/axios'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import AuthIllustration from '@/components/art/AuthIllustration'
import Link from 'next/link'

// Minimal schema for email
const ForgotPasswordSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>

const ForgotPasswordForm = (): React.ReactElement => {
	const t = useTranslations('auth')
	const router = useRouter()
	const [isSuccess, setIsSuccess] = useState(false)

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
		setError: setFormError,
		reset,
	} = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(ForgotPasswordSchema),
		defaultValues: { email: '' },
	})

	const emailValue = watch('email')

	useEffect(() => {
		const unlock = lockScroll()
		return () => unlock()
	}, [])

	const onSubmit = async (data: ForgotPasswordFormData) => {
		try {
			const response = await axios.general.post('/auth/forgot-password', { email: data.email })

			if (response?.data && !response.data.isSuccess) {
				setFormError('root', {
					type: 'manual',
					message: response.data.message || 'Unable to send reset link',
				})
				return
			}

			setIsSuccess(true)
			reset()
			setTimeout(() => router.push('/login'), 5000)
		} catch (err: unknown) {
			let message = 'Network error'
			if (err && typeof err === 'object' && 'response' in err) {
				const e = err as { response?: { data?: { message?: string } }; message?: string }
				message = e.response?.data?.message || e.message || message
			} else if (err instanceof Error) {
				message = err.message
			}
			setFormError('root', { type: 'manual', message })
			setIsSuccess(false)
		}
	}

	return (
		<div
			id='login-form-container'
			className='login-form-container relative pt-8 sm:pt-16 md:pt-32 w-full max-w-5xl min-h-[450px] md:min-h-screen h-auto'
			style={{ paddingTop: '20%' }}
		>
			<div
				id='login-panel'
				className='login-panel relative bg-[#E2EEE2] -translate-y-8 sm:-translate-y-16 md:-translate-y-25 rounded-2xl md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[450px] items-center justify-center md:justify-start'
			>
			<AuthIllustration />

				<div
					id='login-form-wrapper'
					className='login-form-wrapper relative md:absolute md:top-0 md:right-0 md:bottom-0 md:my-auto w-full md:w-1/2 p-6 sm:p-8 md:p-6 flex flex-col justify-center z-40 rounded-2xl md:rounded-[32px] bg-[#E2EEE2] md:shadow-2xl'
				>
					<div className='login-form-content space-y-6 sm:space-y-8'>
						<h1
							id='login-title'
							className='login-title text-3xl sm:text-4xl md:text-5xl font-bold text-[#48715B] text-center tracking-wide'
						>
							{t('forgotPassword')}
						</h1>

						{errors.root && (
							<div
								id='forgot-error-message'
								className='text-red-600 text-xs sm:text-sm text-center bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3'
							>
								{errors.root.message}
							</div>
						)}

						{isSuccess && (
							<div className='text-green-600 text-xs sm:text-sm text-center bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3'>
								Nếu bạn có tài khoản với email đó, bạn sẽ sớm nhận được hướng dẫn để đặt lại mật khẩu trong giây lát.
							</div>
						)}

						<form id='login-form' className='login-form space-y-5 sm:space-y-6' onSubmit={handleSubmit(onSubmit)}>
							<div id='email-input-container' className='email-input-container relative w-full max-w-[360px] sm:w-96 mx-auto'>
								<input
									id='email-input'
									type='email'
									{...register('email')}
									aria-invalid={!!errors.email}
									aria-describedby={errors.email ? 'email-error' : undefined}
									className={`email-input block w-full px-3 py-2.5 sm:py-3 rounded-xl bg-[#E2EEE2] border text-[#8C8C8C] text-lg sm:text-xl font-normal placeholder-transparent focus:outline-none focus:border-[#48715B] focus:ring-0 shadow-none peer ${errors.email ? 'border-red-500' : 'border-[#8C8C8C]/30'}`}
									placeholder='Email'
								/>
								<label
									htmlFor='email-input'
									className={`email-label absolute left-3 top-2.5 sm:top-3 text-lg sm:text-xl font-normal text-[#8C8C8C]/70 bg-[#E2EEE2] px-1 transition-all duration-200 pointer-events-none ${emailValue ? 'scale-70 -translate-y-8 sm:-translate-y-9' : 'peer-focus:scale-70 peer-focus:-translate-y-8 sm:peer-focus:-translate-y-9'}`}
									style={{ transformOrigin: 'left' }}
								>
									{t('email')}:
								</label>
								{errors.email && (
									<p id='email-error' className='email-error text-red-600 text-xs mt-0.5' role='alert'>
										{errors.email.message}
									</p>
								)}
							</div>

							<button
								id='forgot-submit-button'
								type='submit'
								className='login-submit-button block mx-auto w-full max-w-[200px] sm:w-[200px] py-3 sm:py-3.5 rounded-xl text-[#48715B] font-semibold text-base sm:text-lg hover:bg-[#48715B]/90 hover:text-[#E2EEE2] active:bg-[#48715B]/80 focus:outline-none focus:ring-4 focus:ring-[#48715B]/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed'
								disabled={isSubmitting}
							>
								{isSubmitting ? 'Đang gửi...' : 'Xác Nhận'}
							</button>

							<div id='login-links-container' className='login-links-container flex items-center justify-center gap-2 text-xs sm:text-sm pt-2'>
								<Link id='login-link' href='/login' className='register-link text-[#8C8C8C] hover:text-[#48715B]/80 font-medium transition-colors duration-200 hover:underline'>
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

export default ForgotPasswordForm

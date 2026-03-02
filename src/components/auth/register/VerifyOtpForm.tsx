'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { lockScroll } from '@/utils/scrollLock'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
	VerifyOtpSchema,
	type VerifyOtpFormData,
	mapVerifyOtpToApiRequest,
} from '@/types/api/auth/verifyOtp'
import { FORM_STYLES } from './RegisterForm.styles'
import { FloatingLabelInput } from './FloatingLabelInput'
import { ValidationSpeechBubble } from './ValidationSpeechBubble'
import axios from '@/common/axios'
import { useTranslations } from 'next-intl'

const VerifyOtpForm = (): React.ReactElement => {
	const router = useRouter()
	const searchParams = useSearchParams()
	// next/navigation may return null during SSR, guard before usage
	const safeSearchParams = searchParams || new URLSearchParams()
	const t = useTranslations('auth')
	const [isSuccess, setIsSuccess] = useState(false)

	const getAuthErrorMessage = (
		errorMessage?: string,
		fallbackKey: string = 'verifyOtpFailed'
	): string => {
		if (errorMessage?.trim()) {
			try {
				const translated = t(errorMessage.trim())
				return translated !== errorMessage.trim()
					? translated
					: t(fallbackKey)
			} catch {
				return t(fallbackKey)
			}
		}
		return t(fallbackKey)
	}

	const [secondsLeft, setSecondsLeft] = useState(10 * 60) // 10 minutes

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
		setError,
		reset,
	} = useForm<VerifyOtpFormData>({
		resolver: zodResolver(VerifyOtpSchema),
		defaultValues: {
			email: safeSearchParams.get('email') ?? '',
			otp: '',
		},
	})

	// collect field errors for speech bubble
	const fieldErrors: Record<string, string | undefined> = {
		email: errors.email?.message && t(errors.email.message as string),
		otp: errors.otp?.message && t(errors.otp.message as string),
	}


	useEffect(() => {
		const unlock = lockScroll()
		return () => unlock()
	}, [])

	// countdown timer for OTP expiry
	useEffect(() => {
		if (secondsLeft <= 0) return
		const timer = setInterval(() => {
			setSecondsLeft(prev => prev - 1)
		}, 1000)
		return () => clearInterval(timer)
	}, [secondsLeft])

	const onSubmit = async (data: VerifyOtpFormData) => {
		try {
			const requestData = mapVerifyOtpToApiRequest(data)
			const response = await axios.general.post('/auth/verify-otp', requestData)
			if (!response.data.isSuccess) {
				setError('root', {
					type: 'manual',
					message: getAuthErrorMessage(response.data.errorMessage),
				})
				return
			}

			setIsSuccess(true)
			reset()
			setTimeout(() => router.push('/login'), 2000)
		} catch (err: unknown) {
			if (err && typeof err === 'object' && 'response' in err) {
				const axiosError = err as {
					response?: { data?: { errorMessage?: string } }
				}
				const msg = getAuthErrorMessage(
					axiosError.response?.data?.errorMessage
				)
				setError('root', { type: 'manual', message: msg })
			} else if (err instanceof Error) {
				setError('root', { type: 'manual', message: err.message })
			} else {
				setError('root', {
					type: 'manual',
					message: t('verifyOtpFailed'),
				})
			}
		}
	}

	return (
		<div className={`${FORM_STYLES.container.wrapper} relative`}>
			<ValidationSpeechBubble errors={fieldErrors} />
			<div className={FORM_STYLES.container.panel}>
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
						<h3 className={FORM_STYLES.form.title}>{t('verifyOtpTitle')}</h3>
						{isSuccess && (
							<div className='text-green-600 text-xs sm:text-sm text-center bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3'>
								{t('verifyOtpSuccess') || t('verifyOtpTitle')}
							</div>
						)}
						{secondsLeft > 0 && !isSuccess && (
							<p className='text-xs text-center text-[#8C8C8C]'>
								{t('otpExpiresIn', { time: `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2,'0')}` })}
							</p>
						)}
						{secondsLeft <= 0 && !isSuccess && (
							<p className='text-xs text-center text-red-600'>
								{t('otpExpired')}
							</p>
						)}
						<form onSubmit={handleSubmit(onSubmit)} className={FORM_STYLES.form.wrapper}>
							{errors.root && (
								<div className={FORM_STYLES.error.message} role='alert'>
									{errors.root.message}
								</div>
							)}

							{/* hidden email input, prefilled from query param */}
							<input type='hidden' {...control.register('email')} />

							<FloatingLabelInput
								id='otp'
								name='otp'
								control={control}
								type='text'
								label={t('otpLabel')}
								placeholder={t('otpPlaceholder')}
								required
								showError={false}
								disabled={secondsLeft <= 0}
							/>

							<button
								type='submit'
							disabled={isSubmitting || secondsLeft <= 0}
							className={`${FORM_STYLES.button.primary} ${
								(isSubmitting || secondsLeft <= 0) ? FORM_STYLES.button.disabled : ''
							}`}
						>
							{isSubmitting ? t('verifying') : t('verify')}
						</button>
						<div className={FORM_STYLES.link.container}>
							<Link href='/register' className={FORM_STYLES.link.base}>
								{t('backToRegister')}
							</Link>
							<span className={FORM_STYLES.link.separator}>|</span>
							<Link href='/login' className={FORM_STYLES.link.base}>
								{t('login')}
							</Link>
						</div>
						</form>
						</div>
					</div>
				</div>

		</div>
	)
}

export default VerifyOtpForm

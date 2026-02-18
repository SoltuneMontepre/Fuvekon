'use client'

import React, { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
	FORM_CONSTANTS,
	VALIDATION_PATTERNS,
} from '@/utils/validation/registerValidation.constants'
import { useChangePassword } from '@/hooks/services/auth/useAccount'
import { Eye, EyeOff } from 'lucide-react'

type ChangePasswordFormData = {
	currentPassword: string
	newPassword: string
	confirmPassword: string
}

const ChangePasswordPage = () => {
	const t = useTranslations('changePassword')
	const tAuth = useTranslations('auth')
	const [showCurrent, setShowCurrent] = useState(false)
	const [showNew, setShowNew] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)

	const changePasswordMutation = useChangePassword()

	const ChangePasswordSchema = useMemo(
		() =>
			z
				.object({
					currentPassword: z.string().min(1, t('validation.required')),
					newPassword: z
						.string()
						.min(FORM_CONSTANTS.MIN_PASSWORD_LENGTH, t('validation.weakPassword'))
						.max(
							FORM_CONSTANTS.MAX_PASSWORD_LENGTH,
							t('validation.passwordTooLong')
						)
						.regex(VALIDATION_PATTERNS.PASSWORD, t('validation.weakPassword')),
					confirmPassword: z.string().min(1, t('validation.required')),
				})
				.refine(data => data.newPassword === data.confirmPassword, {
					message: t('validation.passwordMismatch'),
					path: ['confirmPassword'],
				})
				.refine(data => data.currentPassword !== data.newPassword, {
					message: t('validation.newPasswordDifferent'),
					path: ['newPassword'],
				}),
		[t]
	)

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
		setError,
	} = useForm<ChangePasswordFormData>({
		resolver: zodResolver(ChangePasswordSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
	})

	const onSubmit = (data: ChangePasswordFormData) => {
		changePasswordMutation.mutate(
			{
				current_password: data.currentPassword,
				new_password: data.newPassword,
				confirm_password: data.confirmPassword,
			},
			{
				onSuccess: response => {
					if (response.isSuccess) {
						toast.success(t('success'))
						reset()
					} else {
						toast.error(response.message || t('failed'))
					}
				},
				onError: (error: unknown) => {
					const err = error as { response?: { data?: { message?: string } } }
					const message =
						err?.response?.data?.message || t('failedRetry')
					toast.error(message)
					if (
						message.toLowerCase().includes('current') ||
						message.toLowerCase().includes('hiện tại')
					) {
						setError('currentPassword', { type: 'manual', message })
					}
				},
			}
		)
	}

	const inputBase =
		'block w-full px-3 py-2.5 rounded-xl bg-[#E2EEE2] border text-[#8C8C8C] text-base font-normal focus:outline-none focus:border-[#48715B] focus:ring-0 shadow-none pr-12'
	const inputError = 'border-red-500'

	return (
		<div className='rounded-[30px] bg-[#E9F5E7] p-8 shadow-sm text-text-secondary'>
			<h1 className='text-3xl font-bold mb-8 text-center'>{t('title')}</h1>

			<form
				onSubmit={handleSubmit(onSubmit)}
				className='max-w-md mx-auto space-y-6'
			>
				<div>
					<label
						htmlFor='currentPassword'
						className='block text-sm font-medium text-[#48715B] mb-2'
					>
						{t('currentPasswordLabel')}
					</label>
					<div className='relative'>
						<input
							id='currentPassword'
							type={showCurrent ? 'text' : 'password'}
							{...register('currentPassword')}
							className={`${inputBase} ${errors.currentPassword ? inputError : 'border-[#8C8C8C]/30'}`}
							placeholder={t('currentPasswordPlaceholder')}
							aria-invalid={!!errors.currentPassword}
						/>
						<button
							type='button'
							onClick={() => setShowCurrent(!showCurrent)}
							className='absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-[#48715B]'
							title={showCurrent ? tAuth('hidePassword') : tAuth('showPassword')}
							tabIndex={-1}
						>
							{showCurrent ? (
								<EyeOff className='w-5 h-5' />
							) : (
								<Eye className='w-5 h-5' />
							)}
						</button>
					</div>
					{errors.currentPassword && (
						<p className='text-red-600 text-xs mt-1'>
							{errors.currentPassword.message}
						</p>
					)}
				</div>

				<div>
					<label
						htmlFor='newPassword'
						className='block text-sm font-medium text-[#48715B] mb-2'
					>
						{t('newPasswordLabel')}
					</label>
					<div className='relative'>
						<input
							id='newPassword'
							type={showNew ? 'text' : 'password'}
							{...register('newPassword')}
							className={`${inputBase} ${errors.newPassword ? inputError : 'border-[#8C8C8C]/30'}`}
							placeholder={t('newPasswordPlaceholder')}
							aria-invalid={!!errors.newPassword}
						/>
						<button
							type='button'
							onClick={() => setShowNew(!showNew)}
							className='absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-[#48715B]'
							title={showNew ? tAuth('hidePassword') : tAuth('showPassword')}
							tabIndex={-1}
						>
							{showNew ? (
								<EyeOff className='w-5 h-5' />
							) : (
								<Eye className='w-5 h-5' />
							)}
						</button>
					</div>
					{errors.newPassword && (
						<p className='text-red-600 text-xs mt-1'>
							{errors.newPassword.message}
						</p>
					)}
				</div>

				<div>
					<label
						htmlFor='confirmPassword'
						className='block text-sm font-medium text-[#48715B] mb-2'
					>
						{t('confirmPasswordLabel')}
					</label>
					<div className='relative'>
						<input
							id='confirmPassword'
							type={showConfirm ? 'text' : 'password'}
							{...register('confirmPassword')}
							className={`${inputBase} ${errors.confirmPassword ? inputError : 'border-[#8C8C8C]/30'}`}
							placeholder={t('confirmPasswordPlaceholder')}
							aria-invalid={!!errors.confirmPassword}
						/>
						<button
							type='button'
							onClick={() => setShowConfirm(!showConfirm)}
							className='absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-[#48715B]'
							title={showConfirm ? tAuth('hidePassword') : tAuth('showPassword')}
							tabIndex={-1}
						>
							{showConfirm ? (
								<EyeOff className='w-5 h-5' />
							) : (
								<Eye className='w-5 h-5' />
							)}
						</button>
					</div>
					{errors.confirmPassword && (
						<p className='text-red-600 text-xs mt-1'>
							{errors.confirmPassword.message}
						</p>
					)}
				</div>

				<div className='pt-4'>
					<button
						type='submit'
						disabled={changePasswordMutation.isPending}
						className='shadow-md w-full py-3 px-4 rounded-lg bg-bg text-text-secondary font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{changePasswordMutation.isPending
							? t('submitting')
							: t('submitButton')}
					</button>
				</div>
			</form>
		</div>
	)
}

export default ChangePasswordPage

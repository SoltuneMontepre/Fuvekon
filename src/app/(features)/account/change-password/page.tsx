'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
	FORM_CONSTANTS,
	VALIDATION_PATTERNS,
	ERROR_MESSAGES,
} from '@/utils/validation/registerValidation.constants'
import { useChangePassword } from '@/hooks/services/auth/useAccount'
import { Eye, EyeOff } from 'lucide-react'

const ChangePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, ERROR_MESSAGES.REQUIRED_FIELD),
		newPassword: z
			.string()
			.min(FORM_CONSTANTS.MIN_PASSWORD_LENGTH, ERROR_MESSAGES.WEAK_PASSWORD)
			.max(FORM_CONSTANTS.MAX_PASSWORD_LENGTH, ERROR_MESSAGES.PASSWORD_TOO_LONG)
			.regex(VALIDATION_PATTERNS.PASSWORD, ERROR_MESSAGES.WEAK_PASSWORD),
		confirmPassword: z.string().min(1, ERROR_MESSAGES.REQUIRED_FIELD),
	})
	.refine(data => data.newPassword === data.confirmPassword, {
		message: ERROR_MESSAGES.PASSWORD_MISMATCH,
		path: ['confirmPassword'],
	})
	.refine(data => data.currentPassword !== data.newPassword, {
		message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
		path: ['newPassword'],
	})

type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>

const ChangePasswordPage = () => {
	const [showCurrent, setShowCurrent] = useState(false)
	const [showNew, setShowNew] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)

	const changePasswordMutation = useChangePassword()

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
						toast.success('Đổi mật khẩu thành công!')
						reset()
					} else {
						toast.error(response.message || 'Đổi mật khẩu thất bại.')
					}
				},
				onError: (error: unknown) => {
					const err = error as { response?: { data?: { message?: string } } }
					const message =
						err?.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.'
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
			<h1 className='text-3xl font-bold mb-8 text-center'>
				ĐỔI MẬT KHẨU
			</h1>

			<form onSubmit={handleSubmit(onSubmit)} className='max-w-md mx-auto space-y-6'>
				<div>
					<label
						htmlFor='currentPassword'
						className='block text-sm font-medium text-[#48715B] mb-2'
					>
						Mật khẩu hiện tại
					</label>
					<div className='relative'>
						<input
							id='currentPassword'
							type={showCurrent ? 'text' : 'password'}
							{...register('currentPassword')}
							className={`${inputBase} ${errors.currentPassword ? inputError : 'border-[#8C8C8C]/30'}`}
							placeholder='Nhập mật khẩu hiện tại'
							aria-invalid={!!errors.currentPassword}
						/>
						<button
							type='button'
							onClick={() => setShowCurrent(!showCurrent)}
							className='absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-[#48715B]'
							title={showCurrent ? 'Ẩn' : 'Hiện'}
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
						Mật khẩu mới
					</label>
					<div className='relative'>
						<input
							id='newPassword'
							type={showNew ? 'text' : 'password'}
							{...register('newPassword')}
							className={`${inputBase} ${errors.newPassword ? inputError : 'border-[#8C8C8C]/30'}`}
							placeholder='Ít nhất 8 ký tự, chữ hoa, chữ thường và số'
							aria-invalid={!!errors.newPassword}
						/>
						<button
							type='button'
							onClick={() => setShowNew(!showNew)}
							className='absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-[#48715B]'
							title={showNew ? 'Ẩn' : 'Hiện'}
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
						Xác nhận mật khẩu mới
					</label>
					<div className='relative'>
						<input
							id='confirmPassword'
							type={showConfirm ? 'text' : 'password'}
							{...register('confirmPassword')}
							className={`${inputBase} ${errors.confirmPassword ? inputError : 'border-[#8C8C8C]/30'}`}
							placeholder='Nhập lại mật khẩu mới'
							aria-invalid={!!errors.confirmPassword}
						/>
						<button
							type='button'
							onClick={() => setShowConfirm(!showConfirm)}
							className='absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-[#48715B]'
							title={showConfirm ? 'Ẩn' : 'Hiện'}
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
							? 'Đang xử lý...'
							: 'Đổi mật khẩu'}
					</button>
				</div>
			</form>
		</div>
	)
}

export default ChangePasswordPage

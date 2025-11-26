'use client'

import React, { useEffect } from 'react'
import { lockScroll } from '@/utils/scrollLock'
import Image from 'next/image'
import Link from 'next/link'
import { useRegisterForm } from '@/hooks/useRegisterForm'
import { FloatingLabelInput } from './RegisterForm/FloatingLabelInput'
import { FORM_STYLES } from './RegisterForm/RegisterForm.styles'

const RegisterForm = (): React.ReactElement => {
	const {
		formData,
		errors,
		isSubmitting,
		isSuccess,
		handleChange,
		handleBlur,
		handleSubmit,
	} = useRegisterForm()

	useEffect(() => {
		const unlock = lockScroll()
		return () => {
			unlock()
		}
	}, [])

	return (
		<div className={FORM_STYLES.container.wrapper}>
			{/* Main Content Panel */}
			<div className={FORM_STYLES.container.panel}>
				{/* Left Side - Character Illustration (background tràn panel) */}
				<div className={FORM_STYLES.container.background}>
					<Image
						src='/images/landing/tranh full oc.webp'
						alt='Fantasy Character'
						fill
						className='object-cover object-[50%_0%] scale-y-150 scale-x-150  translate-x-[-400px] translate-y-[170px]'
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
								Đăng ký thành công! Chuyển hướng...
							</div>
						)}

						{/* Form */}
						<form onSubmit={handleSubmit} className={FORM_STYLES.form.wrapper}>
							{/* General Error Message */}
							{errors.general && (
								<div className={FORM_STYLES.error.message} role='alert'>
									{errors.general}
								</div>
							)}

							{/* Full Name Input */}
							<FloatingLabelInput
								id='fullName'
								type='text'
								value={formData.fullName}
								onChange={value => handleChange('fullName', value)}
								onBlur={() => handleBlur('fullName')}
								label='Họ và tên:'
								placeholder='Họ và tên'
								required
								error={errors.fullName}
							/>

							{/* Nickname Input */}
							<FloatingLabelInput
								id='nickname'
								type='text'
								value={formData.nickname}
								onChange={value => handleChange('nickname', value)}
								onBlur={() => handleBlur('nickname')}
								label='Biệt danh:'
								placeholder='Biệt danh'
								required
								error={errors.nickname}
							/>

							{/* Email Input */}
							<FloatingLabelInput
								id='email'
								type='email'
								value={formData.email}
								onChange={value => handleChange('email', value)}
								onBlur={() => handleBlur('email')}
								label='Gmail:'
								placeholder='Gmail'
								required
								error={errors.email}
							/>

							{/* Country Input */}
							<FloatingLabelInput
								id='country'
								type='text'
								value={formData.country}
								onChange={value => handleChange('country', value)}
								onBlur={() => handleBlur('country')}
								label='Quốc gia:'
								placeholder='Quốc gia'
								required
								error={errors.country}
							/>

							{/* ID Card Input */}
							<FloatingLabelInput
								id='idCard'
								type='text'
								value={formData.idCard}
								onChange={value => handleChange('idCard', value)}
								onBlur={() => handleBlur('idCard')}
								label='Passport ID/ CCCD:'
								placeholder='Passport ID/ CCCD'
								required
								error={errors.idCard}
							/>

							{/* Password Input */}
							<FloatingLabelInput
								id='password'
								type='password'
								value={formData.password}
								onChange={value => handleChange('password', value)}
								onBlur={() => handleBlur('password')}
								label='Mật khẩu:'
								placeholder='Mật khẩu'
								required
								error={errors.password}
								showPasswordToggle
							/>

							{/* Confirm Password Input */}
							<FloatingLabelInput
								id='confirmPassword'
								type='password'
								value={formData.confirmPassword}
								onChange={value => handleChange('confirmPassword', value)}
								onBlur={() => handleBlur('confirmPassword')}
								label='Nhập lại mật khẩu:'
								placeholder='Nhập lại mật khẩu'
								required
								error={errors.confirmPassword}
								showPasswordToggle
							/>

							{/* Submit Button */}
							<button
								type='submit'
								disabled={isSubmitting}
								className={`${FORM_STYLES.button.primary} ${isSubmitting ? FORM_STYLES.button.disabled : ''}`}
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

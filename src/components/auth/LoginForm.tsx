'use client'

import React, { useState, useEffect } from 'react'
import { lockScroll } from '@/utils/scrollLock'
import Image from 'next/image'
import Link from 'next/link'
import { useLogin } from '@/hooks/services/auth/useLogin'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { LoginRequestSchema } from '@/types/api/auth/login'

const LoginForm = (): React.ReactElement => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')

	const t = useTranslations('auth')
	const router = useRouter()
	const loginMutation = useLogin()

	useEffect(() => {
		const unlock = lockScroll()
		return () => {
			unlock()
		}
	}, [])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		// Validate với Zod
		const validation = LoginRequestSchema.safeParse({ email, password })
		if (!validation.success) {
			setError(validation.error.issues[0].message)
			return
		}

		// Call API
		loginMutation.mutate(validation.data, {
			onSuccess: data => {
				if (data.isSuccess) {
					// Redirect về trang chủ sau khi login thành công
					router.push('/')
				} else {
					setError(data.message)
				}
			},
			onError: err => {
				setError(err.message || t('loginFailed'))
			},
		})
	}

	return (
		<div className='relative pt-8 sm:pt-16 md:pt-30 w-full max-w-5xl min-h-[450px] md:min-h-7xl height-auto'>
			{/* Main Content Panel */}
			<div className='relative bg-[#E2EEE2] -translate-y-8 sm:-translate-y-16 md:-translate-y-25 rounded-2xl md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[450px] items-center justify-center md:justify-start'>
				{/* Left Side - Character Illustration (background tràn panel) */}
				<div className='absolute inset-0 w-full h-full z-10 pointer-events-none select-none hidden md:block'>
					<Image
						src='/images/landing/tranh full oc.webp'
						alt='Fantasy Character'
						fill
						className='object-cover object-[50%_0%] scale-y-130 scale-x-130  translate-x-[-380px] translate-y-[-17px]'
						priority
					/>
				</div>
				<div className='relative md:absolute md:top-0 md:right-0 md:bottom-0 md:my-auto w-full md:w-1/2 p-6 sm:p-8 md:p-6 flex flex-col justify-center z-40 rounded-2xl md:rounded-[32px] bg-[#E2EEE2] md:shadow-2xl'>
					<div className='space-y-6 sm:space-y-8'>
						{/* Title */}
						<h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-[#48715B] text-center tracking-wide'>
							{t('loginTitle')}
						</h1>

						{/* Form */}
						<form onSubmit={handleSubmit} className='space-y-5 sm:space-y-6'>
							{/* Error Message */}
							{error && (
								<div className='text-red-600 text-xs sm:text-sm text-center bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3'>
									{error}
								</div>
							)}

							{/* Email Input */}
							<div className='relative w-full max-w-[360px] sm:w-90 mx-auto'>
								<input
									id='email'
									type='email'
									value={email}
									onChange={e => setEmail(e.target.value)}
									className='block w-full px-3 py-2.5 sm:py-3 rounded-xl bg-[#E2EEE2] border border-[#8C8C8C]/30 text-[#8C8C8C] text-lg sm:text-xl font-normal placeholder-transparent focus:outline-none focus:border-[#48715B] focus:ring-0 shadow-none peer'
									placeholder='Email'
									required
								/>
								<label
									htmlFor='email'
									className={`absolute left-3 top-2.5 sm:top-3 text-lg sm:text-xl font-normal text-[#8C8C8C]/70 bg-[#E2EEE2] px-1 transition-all duration-200 pointer-events-none
											${
												email
													? 'scale-70 -translate-y-8 sm:-translate-y-9'
													: 'peer-focus:scale-70 peer-focus:-translate-y-8 sm:peer-focus:-translate-y-9'
											}
										`}
									style={{ transformOrigin: 'left' }}
								>
									{t('email')}:
								</label>
							</div>

							{/* Password Input */}
							<div className='relative w-full max-w-[360px] sm:w-90 mx-auto'>
								<input
									id='password'
									type='password'
									value={password}
									onChange={e => setPassword(e.target.value)}
									className='block w-full px-3 py-2.5 sm:py-3 rounded-xl bg-[#E2EEE2] border border-[#8C8C8C]/30 text-[#8C8C8C] text-lg sm:text-xl font-normal placeholder-transparent focus:outline-none focus:border-[#48715B] focus:ring-0 shadow-none peer'
									placeholder='Mật khẩu'
									required
								/>
								<label
									htmlFor='password'
									className={`absolute left-3 top-2.5 sm:top-3 text-lg sm:text-xl font-normal text-[#8C8C8C]/70 bg-[#E2EEE2] px-1 transition-all duration-200 pointer-events-none
											${
												password
													? 'scale-70 -translate-y-8 sm:-translate-y-9'
													: 'peer-focus:scale-70 peer-focus:-translate-y-8 sm:peer-focus:-translate-y-9'
											}
										`}
									style={{ transformOrigin: 'left' }}
								>
									{t('password')}:
								</label>
							</div>

							{/* Submit Button */}
							<button
								type='submit'
								disabled={loginMutation.isPending}
								className='block mx-auto w-full max-w-[200px] sm:w-[200px] py-3 sm:py-3.5 rounded-xl text-[#48715B] font-semibold text-base sm:text-lg hover:bg-[#48715B]/90 hover:text-[#E2EEE2] active:bg-[#48715B]/80 focus:outline-none focus:ring-4 focus:ring-[#48715B]/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed'
							>
								{loginMutation.isPending ? t('loggingIn') : t('login')}
							</button>

							{/* Links */}
							<div className='flex items-center justify-center gap-2 text-xs sm:text-sm pt-2'>
								<Link
									href='/register'
									className='text-[#8C8C8C] hover:text-[#48715B]/80 font-medium transition-colors duration-200 hover:underline'
								>
									{t('register')}
								</Link>
								<span className='text-[#8C8C8C]/60'>|</span>
								<Link
									href='/forgot-password'
									className='text-[#8C8C8C] hover:text-[#48715B]/80 font-medium transition-colors duration-200 hover:underline'
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

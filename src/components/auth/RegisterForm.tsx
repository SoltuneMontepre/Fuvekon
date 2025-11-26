'use client'

import React, { useState, useEffect } from 'react'
import { lockScroll } from '@/utils/scrollLock'
import Image from 'next/image'
import Link from 'next/link'

const RegisterForm = (): React.ReactElement => {
	const [fullName, setFullName] = useState('')
	const [nickname, setNickname] = useState('')
	const [email, setEmail] = useState('')
	const [country, setCountry] = useState('')
	const [idCard, setIdCard] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	useEffect(() => {
		const unlock = lockScroll()
		return () => {
			unlock()
		}
	}, [])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		// Basic validation
		if (password !== confirmPassword) {
			setError('Mật khẩu không khớp')
			return
		}

		// TODO: Add registration logic here
		console.log({
			fullName,
			nickname,
			email,
			country,
			idCard,
			password,
		})
	}

	return (
		<div className='relative pt-8 sm:pt-16 md:pt-30 w-full max-w-5xl min-h-[700px] md:min-h-7xl height-auto'>
			{/* Main Content Panel */}
			<div className='relative bg-[#E2EEE2] -translate-y-8 sm:-translate-y-16 md:-translate-y-25 rounded-2xl md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[700px] items-center justify-center md:justify-start'>
				{/* Left Side - Character Illustration (background tràn panel) */}
				<div className='absolute inset-0 w-full h-full z-10 pointer-events-none select-none hidden md:block'>
					<Image
						src='/images/landing/tranh full oc.webp'
						alt='Fantasy Character'
						fill
						className='object-cover object-[50%_0%] scale-y-150 scale-x-150  translate-x-[-400px] translate-y-[170px]'
						priority
					/>
				</div>
				<div className='relative md:absolute md:top-0 md:right-0 md:bottom-0 md:my-auto w-full md:w-1/2 p-6 sm:p-8 md:p-6 flex flex-col justify-center z-40 rounded-2xl md:rounded-[32px] bg-[#E2EEE2] md:shadow-2xl'>
					<div className='space-y-4 sm:space-y-5'>
						{/* Title */}
						<h3 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#48715B] text-center tracking-wide'>
							Đăng ký
						</h3>

						{/* Form */}
						<form onSubmit={handleSubmit} className='space-y-3 sm:space-y-4'>
							{/* Error Message */}
							{error && (
								<div className='text-red-600 text-xs sm:text-sm text-center bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3'>
									{error}
								</div>
							)}

							{/* Full Name Input */}
							<div className='relative w-full max-w-[360px] sm:w-90 mx-auto'>
								<input
									id='fullName'
									type='text'
									value={fullName}
									onChange={e => setFullName(e.target.value)}
									className='block w-full px-3 py-2.5 sm:py-3 rounded-xl bg-[#E2EEE2] border border-[#8C8C8C]/30 text-[#8C8C8C] text-lg sm:text-xl font-normal placeholder-transparent focus:outline-none focus:border-[#48715B] focus:ring-0 shadow-none peer'
									placeholder='Họ và tên'
									required
								/>
								<label
									htmlFor='fullName'
									className={`absolute left-3 top-2.5 sm:top-3 text-lg sm:text-xl font-normal text-[#8C8C8C]/70 bg-[#E2EEE2] px-1 transition-all duration-200 pointer-events-none
											${
												fullName
													? 'scale-70 -translate-y-8 sm:-translate-y-9'
													: 'peer-focus:scale-70 peer-focus:-translate-y-8 sm:peer-focus:-translate-y-9'
											}
										`}
									style={{ transformOrigin: 'left' }}
								>
									Họ và tên:
								</label>
							</div>

							{/* Nickname Input */}
							<div className='relative w-full max-w-[360px] sm:w-90 mx-auto'>
								<input
									id='nickname'
									type='text'
									value={nickname}
									onChange={e => setNickname(e.target.value)}
									className='block w-full px-3 py-2.5 sm:py-3 rounded-xl bg-[#E2EEE2] border border-[#8C8C8C]/30 text-[#8C8C8C] text-lg sm:text-xl font-normal placeholder-transparent focus:outline-none focus:border-[#48715B] focus:ring-0 shadow-none peer'
									placeholder='Biệt danh'
									required
								/>
								<label
									htmlFor='nickname'
									className={`absolute left-3 top-2.5 sm:top-3 text-lg sm:text-xl font-normal text-[#8C8C8C]/70 bg-[#E2EEE2] px-1 transition-all duration-200 pointer-events-none
											${
												nickname
													? 'scale-70 -translate-y-8 sm:-translate-y-9'
													: 'peer-focus:scale-70 peer-focus:-translate-y-8 sm:peer-focus:-translate-y-9'
											}
										`}
									style={{ transformOrigin: 'left' }}
								>
									Biệt danh:
								</label>
							</div>

							{/* Email Input */}
							<div className='relative w-full max-w-[360px] sm:w-90 mx-auto'>
								<input
									id='email'
									type='email'
									value={email}
									onChange={e => setEmail(e.target.value)}
									className='block w-full px-3 py-2.5 sm:py-3 rounded-xl bg-[#E2EEE2] border border-[#8C8C8C]/30 text-[#8C8C8C] text-lg sm:text-xl font-normal placeholder-transparent focus:outline-none focus:border-[#48715B] focus:ring-0 shadow-none peer'
									placeholder='Gmail'
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
									Gmail:
								</label>
							</div>

							{/* Country Input */}
							<div className='relative w-full max-w-[360px] sm:w-90 mx-auto'>
								<input
									id='country'
									type='text'
									value={country}
									onChange={e => setCountry(e.target.value)}
									className='block w-full px-3 py-2.5 sm:py-3 rounded-xl bg-[#E2EEE2] border border-[#8C8C8C]/30 text-[#8C8C8C] text-lg sm:text-xl font-normal placeholder-transparent focus:outline-none focus:border-[#48715B] focus:ring-0 shadow-none peer'
									placeholder='Quốc gia'
									required
								/>
								<label
									htmlFor='country'
									className={`absolute left-3 top-2.5 sm:top-3 text-lg sm:text-xl font-normal text-[#8C8C8C]/70 bg-[#E2EEE2] px-1 transition-all duration-200 pointer-events-none
											${
												country
													? 'scale-70 -translate-y-8 sm:-translate-y-9'
													: 'peer-focus:scale-70 peer-focus:-translate-y-8 sm:peer-focus:-translate-y-9'
											}
										`}
									style={{ transformOrigin: 'left' }}
								>
									Quốc gia:
								</label>
							</div>

							{/* ID Card Input */}
							<div className='relative w-full max-w-[360px] sm:w-90 mx-auto'>
								<input
									id='idCard'
									type='text'
									value={idCard}
									onChange={e => setIdCard(e.target.value)}
									className='block w-full px-3 py-2.5 sm:py-3 rounded-xl bg-[#E2EEE2] border border-[#8C8C8C]/30 text-[#8C8C8C] text-lg sm:text-xl font-normal placeholder-transparent focus:outline-none focus:border-[#48715B] focus:ring-0 shadow-none peer'
									placeholder='Passport ID/ CCCD'
									required
								/>
								<label
									htmlFor='idCard'
									className={`absolute left-3 top-2.5 sm:top-3 text-lg sm:text-xl font-normal text-[#8C8C8C]/70 bg-[#E2EEE2] px-1 transition-all duration-200 pointer-events-none
											${
												idCard
													? 'scale-70 -translate-y-8 sm:-translate-y-9'
													: 'peer-focus:scale-70 peer-focus:-translate-y-8 sm:peer-focus:-translate-y-9'
											}
										`}
									style={{ transformOrigin: 'left' }}
								>
									Passport ID/ CCCD:
								</label>
							</div>

							{/* Password Input */}
							<div className='relative w-full max-w-[360px] sm:w-90 mx-auto'>
								<input
									id='password'
									type={showPassword ? 'text' : 'password'}
									value={password}
									onChange={e => setPassword(e.target.value)}
									className='block w-full px-3 py-2.5 sm:py-3 pr-12 rounded-xl bg-[#E2EEE2] border border-[#8C8C8C]/30 text-[#8C8C8C] text-lg sm:text-xl font-normal placeholder-transparent focus:outline-none focus:border-[#48715B] focus:ring-0 shadow-none peer'
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
									Mật khẩu:
								</label>
								<button
									type='button'
									onClick={() => setShowPassword(!showPassword)}
									className='absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-[#48715B] transition-colors duration-200 focus:outline-none'
									title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
									aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
								>
									{showPassword ? (
										<svg
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 24 24'
											strokeWidth={1.5}
											stroke='currentColor'
											className='w-6 h-6'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												d='M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88'
											/>
										</svg>
									) : (
										<svg
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 24 24'
											strokeWidth={1.5}
											stroke='currentColor'
											className='w-6 h-6'
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
							</div>

							{/* Confirm Password Input */}
							<div className='relative w-full max-w-[360px] sm:w-90 mx-auto'>
								<input
									id='confirmPassword'
									type={showConfirmPassword ? 'text' : 'password'}
									value={confirmPassword}
									onChange={e => setConfirmPassword(e.target.value)}
									className='block w-full px-3 py-2.5 sm:py-3 pr-12 rounded-xl bg-[#E2EEE2] border border-[#8C8C8C]/30 text-[#8C8C8C] text-lg sm:text-xl font-normal placeholder-transparent focus:outline-none focus:border-[#48715B] focus:ring-0 shadow-none peer'
									placeholder='Nhập lại mật khẩu'
									required
								/>
								<label
									htmlFor='confirmPassword'
									className={`absolute left-3 top-2.5 sm:top-3 text-lg sm:text-xl font-normal text-[#8C8C8C]/70 bg-[#E2EEE2] px-1 transition-all duration-200 pointer-events-none
											${
												confirmPassword
													? 'scale-70 -translate-y-8 sm:-translate-y-9'
													: 'peer-focus:scale-70 peer-focus:-translate-y-8 sm:peer-focus:-translate-y-9'
											}
										`}
									style={{ transformOrigin: 'left' }}
								>
									Nhập lại mật khẩu:
								</label>
								<button
									type='button'
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className='absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-[#48715B] transition-colors duration-200 focus:outline-none'
									title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
									aria-label={
										showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
									}
								>
									{showConfirmPassword ? (
										<svg
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 24 24'
											strokeWidth={1.5}
											stroke='currentColor'
											className='w-6 h-6'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												d='M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88'
											/>
										</svg>
									) : (
										<svg
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 24 24'
											strokeWidth={1.5}
											stroke='currentColor'
											className='w-6 h-6'
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
							</div>

							{/* Submit Button */}
							<button
								type='submit'
								className='block mx-auto w-full max-w-[200px] sm:w-[200px] py-3 sm:py-3.5 rounded-xl text-[#48715B] font-semibold text-base sm:text-xl hover:bg-[#48715B]/90 hover:text-[#E2EEE2] active:bg-[#48715B]/80 focus:outline-none focus:ring-4 focus:ring-[#48715B]/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
							>
								Đăng ký
							</button>

							{/* Links */}
							<div className='flex items-center justify-center gap-2 text-xs sm:text-sm pt-2'>
								<Link
									href='/login'
									className='text-[#8C8C8C] hover:text-[#48715B]/80 font-bold transition-colors duration-200 hover:underline'
								>
									Đăng nhập
								</Link>
								<span className='text-[#8C8C8C]/60'>|</span>
								<Link
									href='/forgot-password'
									className='text-[#8C8C8C] hover:text-[#48715B]/80 font-medium transition-colors duration-200 hover:underline'
								>
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

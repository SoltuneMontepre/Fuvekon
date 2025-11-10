'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Background from '@/components/landing/hero_section/Background'

const LoginForm = (): React.ReactElement => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		// Handle login logic here
		console.log('Login attempt:', { email, password })
	}

	return (
		<div className='relative max-h-screen flex items-center justify-center overflow-hidden'>
			{/* Landing background, same as landing page */}
			<div className='fixed inset-0 -z-10 select-none pointer-events-none'>
				<Background />
			</div>
			<div className='relative pt-30 w-full max-w-5xl min-h-7xl height-auto'>
				{/* Main Content Panel */}
				<div className='relative bg-[#E2EEE2] rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[450px]'>
					{/* Left Side - Character Illustration (background tràn panel) */}
					<div className='absolute inset-0 w-full h-full z-10 pointer-events-none select-none'>
						<Image
							src='/images/landing/tranh full oc.webp'
							alt='Fantasy Character'
							fill
							className='object-cover object-[50%_0%] scale-y-130 scale-x-130  translate-x-[-380px] translate-y-[-17px]'
							priority
						/>
					</div>
					<div className='absolute top-0 right-0 bottom-0 my-auto w-full md:w-1/2 p-4 md:p-6 flex flex-col justify-center z-40 rounded-[32px] bg-[#E2EEE2] shadow-2xl'>
						<div className='space-y-8'>
							{/* Title */}
							<h1 className='text-4xl md:text-5xl font-bold text-[#48715B] text-center tracking-wide'>
								ĐĂNG NHẬP
							</h1>

							{/* Form */}
							<form onSubmit={handleSubmit} className='space-y-6'>
								{/* Email Input */}
								<div className='relative w-full'>
									<input
										id='email'
										type='email'
										value={email}
										onChange={e => setEmail(e.target.value)}
										className='block w-full px-4 py-5 rounded-xl bg-[#E2EEE2] border border-gray-400 text-gray-600 text-2xl font-semibold placeholder-transparent focus:outline-none focus:border-gray-500 focus:ring-0 shadow-none peer'
										placeholder='Gmail'
										required
									/>
									<label
										htmlFor='email'
										className={`absolute left-4 top-4.5 text-2xl font-semibold text-gray-600 bg-[#E2EEE2] px-1 transition-all duration-200 pointer-events-none
											${
												email
													? 'scale-60 -translate-y-11'
													: 'peer-focus:scale-60 peer-focus:-translate-y-11'
											}
										`}
										style={{ transformOrigin: 'left' }}
									>
										Gmail:
									</label>
								</div>

								{/* Password Input */}
								<div className='relative w-full'>
									<input
										id='password'
										type='password'
										value={password}
										onChange={e => setPassword(e.target.value)}
										className='block w-full px-4 py-5  rounded-xl bg-[#E2EEE2] border border-gray-400 text-gray-600 text-2xl font-semibold placeholder-transparent focus:outline-none focus:border-gray-500 focus:ring-0 shadow-none peer'
										placeholder='Mật khẩu'
										required
									/>
									<label
										htmlFor='password'
										className={`absolute left-4 top-4.5 text-2xl font-semibold text-gray-600 bg-[#E2EEE2] px-1 transition-all duration-200 pointer-events-none
											${
												password
													? 'scale-60 -translate-y-11'
													: 'peer-focus:scale-60 peer-focus:-translate-y-11'
											}
										`}
										style={{ transformOrigin: 'left' }}
									>
										Mật khẩu:
									</label>
								</div>

								{/* Submit Button */}
								<button
									type='submit'
									className='w-full py-3.5 rounded-xl  text-[#48715B] font-semibold text-lg hover:bg-[#48715B]/90 hover:text-[#E2EEE2]  active:bg-[#48715B]/80 focus:outline-none focus:ring-4 focus:ring-[#48715B]/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
								>
									Đăng nhập
								</button>

								{/* Links */}
								<div className='flex items-center justify-center gap-2 text-sm pt-2'>
									<Link
										href='/register'
										className='text-[#48715B] hover:text-[#48715B]/80 font-medium transition-colors duration-200 hover:underline'
									>
										Đăng ký
									</Link>
									<span className='text-[#0A131A]/60'>|</span>
									<Link
										href='/forgot-password'
										className='text-[#48715B] hover:text-[#48715B]/80 font-medium transition-colors duration-200 hover:underline'
									>
										Quên mật khẩu?
									</Link>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default LoginForm

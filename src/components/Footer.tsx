'use client'

import React from 'react'

const Footer = (): React.ReactElement => {
	return (
		<footer
			className='relative z-20 w-full overflow-hidden border-t border-white/10 bg-[#0e2b23] py-8 sm:py-10'
			aria-label='Site footer'
		>
			{/* Background accents (purely decorative) */}
			<div
				aria-hidden='true'
				className='absolute inset-0 pointer-events-none opacity-90'
			>
				{/* Soft color fields */}
				<div className="absolute inset-0 bg-[radial-gradient(900px_240px_at_50%_-80px,rgba(124,188,151,0.35),transparent_60%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(720px_260px_at_0%_60%,rgba(226,238,226,0.12),transparent_55%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(760px_280px_at_100%_70%,rgba(72,113,91,0.25),transparent_58%)]" />

				{/* Subtle asphalt texture overlay */}
				<div className="absolute inset-0 bg-[url('/textures/asfalt-dark.png')] bg-cover bg-center opacity-[0.08]" />

				{/* Top glow line */}
				<div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent' />
			</div>

			<div className='relative px-5 sm:px-10 md:px-20'>
				<div className='max-w-6xl mx-auto text-center space-y-3 text-white'>
					<div className='inline-flex items-center justify-center'>
						<span className='josefin uppercase tracking-widest text-white/90 text-xs sm:text-sm px-4 py-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm'>
							<span className="bg-[url('/textures/asfalt-dark.png')] bg-primary bg-clip-text text-transparent">
								HỘ KINH DOANH FUVE
							</span>
						</span>
					</div>

					<div className='mx-auto h-px w-28 bg-gradient-to-r from-transparent via-white/20 to-transparent' />

					<div className='text-sm sm:text-base text-white/75'>
						Mã số Hộ kinh doanh:{' '}
						<span className='font-mono tracking-wide text-white/85'>
							056204005729
						</span>
					</div>

					<div className='text-[11px] sm:text-xs text-white/55'>
						Thông tin đăng ký hộ kinh doanh
					</div>
				</div>
			</div>
		</footer>
	)
}

export default Footer


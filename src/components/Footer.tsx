'use client'

import React from 'react'
import { FaFacebook, FaXTwitter, FaYoutube } from 'react-icons/fa6'

const socialLinks = [
	{
		href: 'https://www.facebook.com/FUVE.vietnam',
		label: 'Facebook',
		Icon: FaFacebook,
	},
	{
		href: 'https://www.youtube.com/@fuvevietnam',
		label: 'YouTube',
		Icon: FaYoutube,
	},
	{
		href: 'https://x.com/FUVE_VN',
		label: 'X',
		Icon: FaXTwitter,
	},
] as const

const Footer = (): React.ReactElement => {
	return (
		<footer
			className='relative z-20 w-full overflow-hidden border-t border-white/10 bg-[#0e2b23] py-8 sm:py-10'
			aria-label='Site footer'
		>
			{/* Background accents (purely decorative) */}

			<div className='relative px-5 sm:px-10 md:px-20'>
				<div className='max-w-6xl mx-auto text-white'>
					<div className='grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12 md:items-start text-center md:text-left'>
						<div className='flex flex-col items-center md:items-start gap-3'>
							<span className='josefin uppercase tracking-widest text-white/90 text-xs sm:text-sm px-4 py-2'>
								HỘ KINH DOANH FUVE
							</span>
							<div className='h-px w-28 bg-gradient-to-r from-transparent via-white/20 to-transparent md:from-white/15 md:via-white/25 md:to-transparent' />
						</div>

						<nav
							className='flex flex-wrap items-center justify-center gap-4'
							aria-label='Social media'
						>
							{socialLinks.map(({ href, label, Icon }) => (
								<a
									key={href}
									href={href}
									target='_blank'
									rel='noopener noreferrer'
									aria-label={label}
									className='rounded-sm text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60'
								>
									<Icon className='h-6 w-6' aria-hidden />
								</a>
							))}
						</nav>

						<div className='space-y-2 flex flex-col items-center md:items-start'>
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

					<div className='mt-10 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 text-[11px] sm:text-xs items-center text-center sm:text-left'>
						<p className='text-white/45 italic sm:justify-self-start'>
							coded with low cortisol and a bunch of coffee
						</p>
						<p className='font-mono tracking-wide text-white/55 sm:justify-self-end sm:text-right'>
							© FUVE 2026
						</p>
					</div>
				</div>
			</div>
		</footer>
	)
}

export default Footer

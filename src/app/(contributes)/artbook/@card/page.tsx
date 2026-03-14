'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useAuthStore } from '@/stores/authStore'
import Link from 'next/link'

const ArtBookCardSection = () => {
	const t = useTranslations('artbook')
	const isLoggedIn = useAuthStore(state => state.isAuthenticated)

	return (
		<div className='max-w-6xl mx-auto px-6 py-16'>
			<div className='relative flex flex-col md:flex-row shadow-xl'>
				{/* LEFT PANEL */}
				<div className='md:w-[1300px] bg-[#48715B] px-16 flex flex-col rounded-2xl md:rounded-r-none z-10 relative'>
					<Image
						src='/images/artbook/FUVEICON.png'
						alt='Fuve Icon'
						className='absolute  z-0 pointer-events-none object-contain'
						draggable={false}
						fill
					/>
				</div>

				{/* RIGHT PANEL */}
				<div className='md:w-[1700px] bg-[#E2EEE2] p-12 rounded-2xl md:-ml-10 relative overflow-hidden shadow-2xl z-20'>
					<Image
						src='/assets/common/drum_pattern.webp'
						alt='Drum Pattern'
						fill
						className='absolute inset-0 z-0 opacity-[3%] object-cover pointer-events-none'
						draggable={false}
					/>
					<h3 className='text-2xl text-center font-bold text-secondary mb-6'>
						{t('artbook.card.righttitle')}
					</h3>
					{/* appear when user not logged in */}
					{!isLoggedIn ? (
						<>
							<p className='text-[#48715B] text-sm mt-4 leading-relaxed'>
								{t('artbook.card.rightdescription')}
							</p>

							<div className='flex flex-col justify-center'>
								{/* Links */}
								<div className='text-center text-nowrap text-text-primary mt-2 font-bold'>
									<Link href='/login'>{t('artbook.card.login')}</Link>
									<span> | </span>
									<Link href='/ticket'>{t('artbook.card.buyticket')}</Link>
								</div>
							</div>
						</>
					) : (
						<form className='flex flex-col gap-6'>
							<p className='text-[#48715B] text-sm mt-4 leading-relaxed'>
								{t('artbook.card.rightdescription')}
							</p>

							<div className='text-center text-nowrap mt-2 text-[#8C8C8C] transition-colors duration-200'>
								<Link
									href='/account/conbook'
									className='hover:!text-[#48715B]/80 font-medium transition-colors duration-200'
								>
									{t('artbook.card.conbookLink')}
								</Link>
								<span> | </span>
								<Link
									href='/ticket'
									className='hover:!text-[#48715B]/80 font-medium transition-colors duration-200'
								>
									{t('artbook.card.buyticket')}
								</Link>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	)
}

export default ArtBookCardSection

'use client'

import gsap from '@/common/gsap'
import { useGSAP } from '@gsap/react'
import { Clock, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Lightbox from '@/components/common/Lightbox'
import Image from 'next/image'
import React, { useRef, useState } from 'react'

const INFO_IMAGES = [
	'/images/landing/hotel room.webp',
	'/images/landing/hotel.webp',
	'/images/landing/venue-3.png',
]

interface InfoSectionProps {
	prefersReducedMotion?: boolean
}

const InfoSection = ({ prefersReducedMotion = false }: InfoSectionProps) => {
	const t = useTranslations('landing.info')
	const sectionRef = useRef<HTMLDivElement>(null)
	const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

	useGSAP(
		() => {
			if (prefersReducedMotion) return

			// Big date block slides up on enter
			gsap.fromTo(
				'.info-date',
				{ y: 70, autoAlpha: 0 },
				{
					y: 0,
					autoAlpha: 1,
					duration: 1,
					ease: 'power3.out',
					scrollTrigger: {
						trigger: '#info-section',
						start: 'top 75%',
						toggleActions: 'play none none reverse',
					},
				}
			)

			// Detail rows stagger in from the left
			gsap.fromTo(
				'.info-detail',
				{ x: -50, autoAlpha: 0 },
				{
					x: 0,
					autoAlpha: 1,
					duration: 0.8,
					stagger: 0.18,
					ease: 'power3.out',
					scrollTrigger: {
						trigger: '#info-section',
						start: 'top 70%',
						toggleActions: 'play none none reverse',
					},
				}
			)

			// Images slide in from the right with stagger
			gsap.fromTo(
				'.info-image',
				{ x: 80, autoAlpha: 0 },
				{
					x: 0,
					autoAlpha: 1,
					duration: 0.9,
					stagger: 0.2,
					ease: 'power3.out',
					scrollTrigger: {
						trigger: '#info-section',
						start: 'top 65%',
						toggleActions: 'play none none reverse',
					},
				}
			)
		},
		{ scope: sectionRef, dependencies: [prefersReducedMotion] }
	)

	return (
		<div
			id='info-section'
			ref={sectionRef}
			className='h-dvh w-dvw relative z-10 section'
		>
			{/* Full-section dark overlay for readability, same pattern as ThemeSection */}
			<div className='absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/65 to-slate-950/50 z-0' />

			<div className='relative h-full flex items-center justify-center px-8 md:px-20'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 w-full max-w-6xl items-center'>
					{/* ── Left: Date + Location ── */}
					<div className='flex flex-col gap-10'>
						{/* Big date display */}
						<div className='info-date flex flex-col leading-none'>
							<span className='text-primary text-base font-semibold uppercase tracking-[0.35em] mb-2 drop-shadow-md'>
								{t('year')}
							</span>
							<span className='text-text text-[8rem] md:text-[10rem] font-black tracking-tight drop-shadow-lg'>
								{t('day')}
							</span>
							<span className='text-text text-3xl md:text-4xl font-bold uppercase tracking-widest mt-1 drop-shadow-md'>
								{t('month')}
							</span>
						</div>

						{/* Detail rows */}
						<div className='flex flex-col gap-5 select-all z-50'>
							<div className='info-detail flex items-start gap-4'>
								<Clock className='w-6 h-6 text-primary mt-0.5 shrink-0 drop-shadow' />
								<div>
									<p className='text-text font-semibold text-lg leading-snug drop-shadow'>
										{t('time')}
									</p>
									<p className='text-text/75 text-sm mt-0.5'>
										{t('timeDetail')}
									</p>
								</div>
							</div>

							<div className='info-detail select-all flex items-start gap-4 z-50'>
								<MapPin className='w-6 h-6 text-primary mt-0.5 shrink-0 drop-shadow' />
								<div>
									<p className='text-text select-text font-semibold text-lg leading-snug drop-shadow'>
										Eastin Grand Hotel Saigon
									</p>
									<p className='text-text/75 select-text text-sm mt-0.5'>
										253 Đ. Nguyễn Văn Trỗi, Phường 10, Phú Nhuận, Thành phố Hồ
										Chí Minh, Vietnam
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* ── Right: Venue images ── */}
					<div className='flex flex-col gap-4'>
						{/* Primary large image */}
						<div className='info-image relative h-56 md:h-64 rounded-2xl overflow-hidden shadow-2xl z-50 ring-1 ring-white/10'>
							<iframe
								className='w-full h-full rounded-2xl z-50'
								src='https://maps.google.com/maps?width=600&height=400&hl=en&q=Eastin%20Grand%20Hotel%20Saigon&t=&z=14&ie=UTF8&iwloc=B&output=embed'
								allowFullScreen
							/>
							<div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none' />
						</div>

						{/* Two smaller images side-by-side */}
						<div className='flex gap-4'>
							<button
								type='button'
								onClick={() => setLightboxSrc(INFO_IMAGES[0])}
								className='info-image relative flex-1 h-40 md:h-44 rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/10 cursor-pointer'
							>
								<Image
									src={INFO_IMAGES[0]}
									alt={t('venue')}
									fill
									className='object-cover transition-transform duration-300 hover:scale-105'
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
							</button>
							<button
								type='button'
								onClick={() => setLightboxSrc(INFO_IMAGES[1])}
								className='info-image relative flex-1 h-40 md:h-44 rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/10 cursor-pointer'
							>
								<Image
									src={INFO_IMAGES[1]}
									alt={t('venue')}
									fill
									className='object-cover transition-transform duration-300 hover:scale-105'
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom divider */}
			<div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent' />

			<Lightbox
				src={lightboxSrc}
				alt={t('venue')}
				onClose={() => setLightboxSrc(null)}
			/>
		</div>
	)
}

export default InfoSection

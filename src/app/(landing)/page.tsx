'use client'

import gsap from '@/common/gsap'
import GOHSection from '@/components/landing/GOHSection'
import HeroSection from '@/components/landing/HeroSection'
import InfoSection from '@/components/landing/InfoSection'
import ThemeSection from '@/components/landing/ThemeSection'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const LandingPage = (): React.JSX.Element => {
	useGSAP(() => {
		const sections = gsap.utils.toArray<HTMLElement>('.section')

		sections.forEach(section => {
			ScrollTrigger.create({
				trigger: section,
				start: 'top top',
				end: 'bottom top',
				snap: {
					snapTo: 1,
					duration: { min: 0.4, max: 1 },
					ease: 'power2.inOut',
				},
			})
		})

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: '.theme-section',
				start: 'top 80%',
				endTrigger: '#goh-section',
				end: 'top 20%',
				scrub: 1,
			},
		})

		tl.to('#background-container', {
			scale: 1.5,
			x: '10%',
			y: '5%',
			duration: 1,
		}).to('#background-container', {
			scale: 1,
			x: 0,
			y: 0,
			duration: 1,
		})

		ScrollTrigger.create({
			trigger: '#goh-section',
			start: 'top 70%',
			end: 'bottom top',
			onEnter: () => {
				gsap.to('#mascot', {
					opacity: 0,
					duration: 0.3,
					ease: 'power2.out',
				})
			},
			onLeaveBack: () => {
				gsap.to('#mascot', { opacity: 1, duration: 0.3, ease: 'power2.out' })
			},
		})
	}, [])

	return (
		<div className='absolute inset-0 landing-container'>
			{/* Landing Section */}
			<HeroSection />

			{/* Infomation Section */}
			<InfoSection />

			{/* Introduction + Theme */}
			<ThemeSection />

			{/* GOH */}
			<GOHSection />

			{/* ArtBook */}
			<div
				id='contribute-start'
				className='h-dvh w-dvw pointer-events-none relative z-10 section'
			>
				<div className='h-full center text-black'> Info </div>
			</div>

			{/* Dealer */}
			<div className='h-dvh w-dvw pointer-events-none relative z-10 section'>
				<div className='h-full center text-black'> Info </div>
			</div>

			{/* Talent */}
			<div className='h-dvh w-dvw pointer-events-none relative z-10 section'>
				<div className='h-full center text-black'> Info </div>
			</div>
		</div>
	)
}

export default LandingPage

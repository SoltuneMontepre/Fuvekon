'use client'

import gsap from '@/common/gsap'
import DrumImage from '@/components/landing/DrumImage'
import GOHSection from '@/components/landing/GOHSection'
import HeroSection from '@/components/landing/HeroSection'
import InfoSection from '@/components/landing/InfoSection'
import ThemeSection from '@/components/landing/ThemeSection'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useState } from 'react'

const LandingPage = (): React.JSX.Element => {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
		setPrefersReducedMotion(mediaQuery.matches)

		const handleChange = (e: MediaQueryListEvent) => {
			setPrefersReducedMotion(e.matches)
		}

		mediaQuery.addEventListener('change', handleChange)
		return () => mediaQuery.removeEventListener('change', handleChange)
	}, [])

	useGSAP(() => {
		if (prefersReducedMotion) {
			// Disable animations for reduced motion
			gsap.set('#background-container', { clearProps: 'all' })
			gsap.set('#mascot', { clearProps: 'all' })
			gsap.set('#theme-title', { clearProps: 'all' })
			return
		}

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
				scrub: true,
				invalidateOnRefresh: true,
			},
		})

		gsap.set('#background-container', {
			willChange: 'transform',
			force3D: true,
		})

		tl.to('#background-container', {
			scale: 1.15,
			x: '5%',
			y: '2.5%',
			ease: 'none',
			force3D: true,
			overwrite: 'auto',
		}).to('#background-container', {
			scale: 1,
			x: 0,
			y: 0,
			ease: 'none',
			force3D: true,
			overwrite: 'auto',
		})

		ScrollTrigger.create({
			trigger: '#goh-section',
			start: 'top 70%',
			end: 'bottom top',
			onEnter: () => {
				gsap.to('#mascot', {
					autoAlpha: 0,
					duration: 0.3,
					ease: 'power2.out',
					force3D: true,
				})
			},
			onLeaveBack: () => {
				gsap.to('#mascot', {
					autoAlpha: 1,
					duration: 0.3,
					ease: 'power2.out',
					force3D: true,
				})
			},
		})

		gsap
			.timeline({
				scrollTrigger: {
					trigger: '#info-section',
					start: 'top 80%',
					end: 'bottom top',
					scrub: true,
					invalidateOnRefresh: true,
				},
			})
			.to('#theme-title', {
				autoAlpha: 0,
				scale: 3,
				ease: 'linear',
				force3D: true,
			})
	}, [prefersReducedMotion])

	return (
		<div className='absolute inset-0 landing-container'>
			{/* Landing Section */}
			<HeroSection />

			{/* Infomation Section */}
			<InfoSection />

			{/* Introduction + Theme */}
			<ThemeSection prefersReducedMotion={prefersReducedMotion} />

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
			<div className='h-dvh w-dvw grid grid-cols-[1fr_2fr] pointer-events-none relative z-10 section'>
				<div className='h-full w-full bg-red-200'>
					<DrumImage id='drum' />
				</div>
				<div className='h-full w-full bg-yellow-300'></div>
			</div>

			{/* Talent */}
			<div className='h-dvh w-dvw pointer-events-none relative z-10 section'>
				<div className='h-full center text-black'> Info </div>
			</div>
		</div>
	)
}

export default LandingPage

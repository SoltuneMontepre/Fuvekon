'use client'

import gsap from '@/common/gsap'
import FeatSection from '@/components/landing/FeatSection'
import GOHSection from '@/components/landing/GOHSection'
import HeroSection from '@/components/landing/HeroSection'
import InfoSection from '@/components/landing/InfoSection'
import ThemeSection from '@/components/landing/ThemeSection'
import { useThemeStore } from '@/config/Providers/ThemeProvider'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const LandingPage = (): React.JSX.Element => {
	const router = useRouter()
	const [isLoaded, setIsLoaded] = useState(false)
	const t = useTranslations('landing')

	const prefersReducedMotion = useThemeStore(
		state => state.prefersReducedMotion
	)

	useEffect(() => {
		setIsLoaded(true)
	}, [])

	useEffect(() => {
		if (typeof window === 'undefined') return
		const hash = window.location.hash
		if (hash && hash.includes('token=')) {
			router.push(`/reset-password${hash}`)
			return
		}
		const params = new URLSearchParams(window.location.search)
		const q = params.get('token')
		if (q) {
			router.push(`/reset-password${window.location.search}`)
		}
	}, [router])

	useGSAP(() => {
		if (prefersReducedMotion) {
			gsap.set('#background-container', { clearProps: 'all' })
			gsap.set('#mascot', { clearProps: 'autoAlpha' })
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
		<div
			className='absolute inset-0 landing-container transition-opacity duration-500 ease-out'
			style={{ opacity: isLoaded ? 1 : 0 }}
		>
			{/* Landing Section */}
			<HeroSection reducedMotion={prefersReducedMotion} />

			{/* Infomation Section */}
			<InfoSection />

			{/* Introduction + Theme */}
			<ThemeSection prefersReducedMotion={prefersReducedMotion} />

			{/* GOH */}
			<GOHSection />

			{/* ArtBook */}
			<div>
				<FeatSection
					title={t('artbook.title')}
					description={t('artbook.description')}
					buttonLabel={t('artbook.buttonLabel')}
					buttonHref={t('artbook.buttonHref')}
					images={[
						'/images/artbook/badges.png',
						'/images/artbook/badges.png',
						'/images/artbook/badges.png',
					]}
				/>

				{/* Dealer */}
				<FeatSection
					title={t('dealer.title')}
					description={t('dealer.description')}
					buttonLabel={t('dealer.buttonLabel')}
					buttonHref={t('dealer.buttonHref')}
					images={[
						'/images/artbook/badges.png',
						'/images/artbook/badges.png',
						'/images/artbook/badges.png',
					]}
				/>

				{/* Talent */}
				<FeatSection
					title={t('talent.title')}
					description={t('talent.description')}
					buttonLabel={t('talent.buttonLabel')}
					buttonHref={t('talent.buttonHref')}
					images={[
						'/images/artbook/badges.png',
						'/images/artbook/badges.png',
						'/images/artbook/badges.png',
					]}
				/>
			</div>
		</div>
	)
}

export default LandingPage

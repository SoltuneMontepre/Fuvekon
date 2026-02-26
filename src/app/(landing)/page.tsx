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
import { BiUpArrow } from 'react-icons/bi'

const LandingPage = (): React.JSX.Element => {
	const router = useRouter()
	const [isLoaded, setIsLoaded] = useState(false)
	const [showBackToTop, setShowBackToTop] = useState(false)
	const t = useTranslations('landing')

	const prefersReducedMotion = useThemeStore(
		state => state.prefersReducedMotion
	)

	useEffect(() => {
		setIsLoaded(true)
	}, [])

	useEffect(() => {
		const handleScroll = () => {
			const firstSection = document.querySelector('.section')
			if (firstSection) {
				const firstSectionHeight = firstSection.getBoundingClientRect().bottom
				setShowBackToTop(window.scrollY > firstSectionHeight)
			}
		}

		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

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
		const sections = gsap.utils.toArray<HTMLElement>('.section')

		let isSnapping = false

		const getCurrentIndex = () => {
			const scrollY = window.scrollY
			let closestIndex = 0
			let closestDistance = Number.POSITIVE_INFINITY

			sections.forEach((section, index) => {
				const distance = Math.abs(scrollY - section.offsetTop)
				if (distance < closestDistance) {
					closestDistance = distance
					closestIndex = index
				}
			})

			return closestIndex
		}

		const scrollToIndex = (index: number) => {
			const target = sections[index]
			if (!target) return
			isSnapping = true
			window.scrollTo({ top: target.offsetTop, behavior: 'smooth' })
			window.setTimeout(() => {
				isSnapping = false
			}, 700)
		}

		const handleWheel = (event: WheelEvent) => {
			if (!sections.length || event.deltaY === 0) return
			if (isSnapping) {
				event.preventDefault()
				return
			}

			event.preventDefault()
			const direction = event.deltaY > 0 ? 1 : -1
			const currentIndex = getCurrentIndex()
			const nextIndex = Math.min(
				Math.max(currentIndex + direction, 0),
				sections.length - 1
			)

			if (nextIndex !== currentIndex) {
				scrollToIndex(nextIndex)
			}
		}

		window.addEventListener('wheel', handleWheel, { passive: false })

		return () => {
			window.removeEventListener('wheel', handleWheel)
		}
	})

	useGSAP(() => {
		if (prefersReducedMotion) {
			gsap.set('#background-container', { clearProps: 'all' })
			gsap.set('#mascot', { clearProps: 'autoAlpha' })
			gsap.set('#theme-title', { clearProps: 'all' })
			return
		}

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

		gsap.timeline({
			scrollTrigger: {
				trigger: '#drum-feat',
				markers: true,
			},
		})
	}, [prefersReducedMotion])

	return (
		<div
			className='absolute inset-0 landing-container transition-opacity duration-500 ease-out'
			style={{ opacity: isLoaded ? 1 : 0 }}
		>
			{/* Back to Top Button */}
			{showBackToTop && (
				<button
					onClick={scrollToTop}
					className='fixed bottom-6 right-6 z-50 p-3 rounded-lg bg-secondary text-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110'
					aria-label='Back to top'
					title='Back to top'
				>
					<BiUpArrow />
				</button>
			)}

			{/* Landing Section */}
			<HeroSection reducedMotion={prefersReducedMotion} />

			{/* Infomation Section */}
			<InfoSection />

			{/* Introduction + Theme */}
			<ThemeSection prefersReducedMotion={prefersReducedMotion} />

			{/* GOH */}
			<GOHSection />

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
	)
}

export default LandingPage

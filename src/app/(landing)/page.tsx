'use client'

import gsap from '@/common/gsap'
import DrumImage from '@/components/landing/DrumImage'
import FeatSection from '@/components/landing/FeatSection'
import GOHSection from '@/components/landing/GOHSection'
import HeroSection from '@/components/landing/HeroSection'
import InfoSection from '@/components/landing/InfoSection'
import ThemeSection from '@/components/landing/ThemeSection'
import { GOH_ENABLED, INFO_ENABLED } from '@/config/app'
import { useThemeStore } from '@/config/Providers/ThemeProvider'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import TicketSection from '@/components/landing/TicketSection'

const LandingPage = (): React.JSX.Element => {
	const router = useRouter()
	const [isLoaded, setIsLoaded] = useState(false)
	const [showBackToTop, setShowBackToTop] = useState(false)
	const [gohActiveCharacter, setGohActiveCharacter] = useState<0 | 1 | 2>(0)
	const gohStepRef = useRef<0 | 1 | 2>(0)
	const isSnappingRef = useRef(false)
	const lastEventTimeRef = useRef(0)
	const touchStartYRef = useRef(0)
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

		const COOLDOWN = 700 // ms — matches the snap timeout

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

		const scrollToIndex = (index: number, direction: number) => {
			const target = sections[index]
			if (!target) return
			isSnappingRef.current = true
			gsap.to(window, {
				scrollTo: { y: target.offsetTop, autoKill: false },
				duration: 0.7,
				ease: 'power2.inOut',
				overwrite: 'auto',
				onComplete: () => {
					isSnappingRef.current = false
				},
			})
			if (target.id === 'goh-section') {
				const step = direction < 0 ? 2 : 1
				gohStepRef.current = step as 1 | 2
				setGohActiveCharacter(step as 1 | 2)
			} else if (gohStepRef.current !== 0) {
				gohStepRef.current = 0
				setGohActiveCharacter(0)
			}
		}

		const snapByDirection = (direction: number, now: number) => {
			const currentIndex = getCurrentIndex()
			const currentSection = sections[currentIndex]

			if (currentSection?.id === 'goh-section') {
				if (direction > 0 && gohStepRef.current === 1) {
					gohStepRef.current = 2
					setGohActiveCharacter(2)
					lastEventTimeRef.current = now
					return
				}
				if (direction < 0 && gohStepRef.current === 2) {
					gohStepRef.current = 1
					setGohActiveCharacter(1)
					lastEventTimeRef.current = now
					return
				}
			}

			const nextIndex = Math.min(
				Math.max(currentIndex + direction, 0),
				sections.length - 1
			)

			if (nextIndex !== currentIndex) {
				scrollToIndex(nextIndex, direction)
			}
		}

		const handleWheel = (event: WheelEvent) => {
			if (!sections.length || event.deltaY === 0) return
			event.preventDefault()

			const now = Date.now()
			if (isSnappingRef.current || now - lastEventTimeRef.current < COOLDOWN)
				return
			lastEventTimeRef.current = now

			const direction = event.deltaY > 0 ? 1 : -1
			snapByDirection(direction, now)
		}

		const handleTouchStart = (event: TouchEvent) => {
			touchStartYRef.current = event.touches[0].clientY
		}

		// Prevent native scroll so we own the vertical movement
		const handleTouchMove = (event: TouchEvent) => {
			event.preventDefault()
		}

		const handleTouchEnd = (event: TouchEvent) => {
			if (!sections.length) return
			const touchEndY = event.changedTouches[0].clientY
			const deltaY = touchStartYRef.current - touchEndY // positive → swipe up → scroll down

			// Ignore taps or very short drags
			if (Math.abs(deltaY) < 30) return

			const now = Date.now()
			if (isSnappingRef.current || now - lastEventTimeRef.current < COOLDOWN)
				return
			lastEventTimeRef.current = now

			const direction = deltaY > 0 ? 1 : -1
			snapByDirection(direction, now)
		}

		window.addEventListener('wheel', handleWheel, { passive: false })
		window.addEventListener('touchstart', handleTouchStart, { passive: true })
		window.addEventListener('touchmove', handleTouchMove, { passive: false })
		window.addEventListener('touchend', handleTouchEnd, { passive: true })

		return () => {
			window.removeEventListener('wheel', handleWheel)
			window.removeEventListener('touchstart', handleTouchStart)
			window.removeEventListener('touchmove', handleTouchMove)
			window.removeEventListener('touchend', handleTouchEnd)
		}
	})

	useGSAP(() => {
		if (prefersReducedMotion) {
			gsap.set('#background-container', { clearProps: 'all' })
			gsap.set('#theme-title', { clearProps: 'all' })
		} else {
			if (GOH_ENABLED) {
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
			}

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
		}

		const mascotTrigger = GOH_ENABLED ? '#goh-section' : '#feat-start'
		const mascotDuration = 0.3
		ScrollTrigger.create({
			trigger: mascotTrigger,
			start: 'top 70%',
			end: 'bottom top',
			onEnter: () => {
				gsap.to('#mascot', {
					autoAlpha: 0,
					duration: mascotDuration,
					ease: 'power2.out',
					force3D: true,
				})
				gsap.to('#moon', {
					autoAlpha: 0,
					duration: mascotDuration,
					ease: 'power2.out',
					force3D: true,
				})
			},
			onLeaveBack: () => {
				gsap.to('#mascot', {
					autoAlpha: 1,
					duration: mascotDuration,
					ease: 'power2.out',
					force3D: true,
				})
				gsap.to('#moon', {
					autoAlpha: 1,
					duration: mascotDuration,
					ease: 'power2.out',
					force3D: true,
				})
			},
		})
	}, [])

	useGSAP(() => {
		gsap.set('#feat-drum', { x: '-110vw', scale: 0, autoAlpha: 0 })
		gsap.set('#feat-drum-spinner', { rotation: -360 })
		gsap.set('#feat-drum-line', { rotation: 360 })

		gsap
			.timeline({
				scrollTrigger: {
					trigger: '#feat-start',
					start: 'top bottom',
					end: 'top top',
					scrub: 1.5,
					invalidateOnRefresh: true,
				},
			})
			.to('#feat-drum', { x: '-50vw', scale: 1, autoAlpha: 1 }, 0)
			.to('#feat-drum-spinner', { rotation: 0, ease: 'none' }, 0)
			.to('#feat-drum-line', { rotation: 0, ease: 'none' }, 0)

		gsap
			.timeline({
				scrollTrigger: {
					trigger: '#feat-sections',
					start: 'top top',
					end: 'bottom bottom',
					scrub: 1.5,
					invalidateOnRefresh: true,
				},
			})
			.to('#feat-drum-spinner', { rotation: 720, ease: 'none' }, 0)
			.to('#feat-drum-line', { rotation: -720, ease: 'none' }, 0)

		gsap
			.timeline({
				scrollTrigger: {
					trigger: '#ticket-section',
					start: 'top bottom',
					end: 'top top',
					scrub: 1.5,
					invalidateOnRefresh: true,
				},
			})
			.to('#feat-drum', { x: '0vw', ease: 'none' }, 0)
			.to(
				'#feat-drum-spinner',
				{ rotation: '+=720', scale: 1.5, autoAlpha: 0.7, ease: 'none' },
				0
			)
			.to('#feat-drum-line', { rotation: '-=720', ease: 'none' }, 0)
	}, [])

	return (
		<div
			className='absolute inset-0 landing-container transition-opacity duration-500 ease-out'
			style={{ opacity: isLoaded ? 1 : 0 }}
		>
			{/* Back to Top Button */}
			<button
				onClick={scrollToTop}
				className={`fixed bottom-8 right-8 z-50 w-11 h-11 flex items-center justify-center rounded-full bg-bg/80 backdrop-blur-sm border border-text-primary/15 text-text-secondary shadow-lg hover:shadow-xl hover:border-text-primary/30 hover:text-text-primary active:scale-95 transition-all duration-300 ${showBackToTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
				aria-label='Back to top'
				title='Back to top'
			>
				<ArrowUp className='w-4 h-4' strokeWidth={2.5} />
			</button>

			{/* Landing Section */}
			<HeroSection reducedMotion={prefersReducedMotion} />

			{/* Infomation Section */}
			{INFO_ENABLED && (
				<InfoSection prefersReducedMotion={prefersReducedMotion} />
			)}

			{/* Introduction + Theme */}
			<ThemeSection prefersReducedMotion={prefersReducedMotion} />

			{/* GOH */}
			{GOH_ENABLED && <GOHSection activeCharacter={gohActiveCharacter} />}

			<div id='feat-sections'>
				<FeatSection
					id='feat-start'
					title={t('artbook.title')}
					description={t('artbook.description')}
					buttonLabel={t('artbook.buttonLabel')}
					buttonHref='/artbook'
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
					buttonHref='/dealer'
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
					buttonHref='/contributes/talent'
					images={[
						'/images/artbook/badges.png',
						'/images/artbook/badges.png',
						'/images/artbook/badges.png',
					]}
				/>
			</div>

			<TicketSection id='ticket-section' />

			<div className='fixed inset-0 flex items-center justify-center pointer-events-none overflow-visible'>
				<DrumImage id='feat-drum' className='' />
			</div>
		</div>
	)
}

export default LandingPage

'use client'

import gsap from '@/common/gsap'
import DrumImage from '@/components/landing/DrumImage'
import GOHSection from '@/components/landing/GOHSection'
import HeroSection from '@/components/landing/HeroSection'
import InfoSection from '@/components/landing/InfoSection'
import ThemeSection from '@/components/landing/ThemeSection'
import { useThemeStore } from '@/config/Providers/ThemeProvider'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const LandingPage = (): React.JSX.Element => {
	const prefersReducedMotion = useThemeStore(
		state => state.prefersReducedMotion
	)

	const router = useRouter()
	useEffect(() => {
		if (typeof window === 'undefined') return
		const hash = window.location.hash
		if (hash && hash.includes('token=')) {
			router.push(`/reset-password${hash}`)
		}
	}, [router])

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
			<GOHSection disable={prefersReducedMotion} />

			{/* ArtBook */}
			<div
				id='contribute-start'
				className='h-dvh w-dvw pointer-events-none relative z-10 section'
			>
				<div className='h-full center text-black'> Info </div>
			</div>

			{/* Dealer */}
			<div className='relative h-dvh w-full grid grid-cols-[30%_70%] z-10 section'>
				<div className='h-full w-full flex items-center justify-end overflow-visible'>
					<div>
						<DrumImage id='drum' disable={prefersReducedMotion} isEnter />
					</div>
				</div>
				<div className='h-full w-full pointer-events-auto flex flex-col items-start justify-center'>
					<div className='flex flex-col w-full items-end justify-end pr-28 gap-8'>
						<h2 className='text-6xl font-bold text-white tracking-wider'>
							FUVE&apos;S ARTBOOK
						</h2>
						<p className='text-white/90 text-lg max-w-3xl text-right text-wrap'>
							AKHJGKL HGDSFFHJGHGDSFFHJG JKDELJGDKFJGKHKJJSDFBJSD AB
							BFJKSAHKJFCABSDFJ URBSDIUFHJSDIUFHJK SDAFHKJS ADHFJSDFKHJSDF
							KBJSAK HJGKLHGDSFFHJGDJSF FHJGJKDFHJGDKF GKHK JSDFBJSDABFKJSAH
							KJCAFJHSDIUFHJSDIUFH JSDIUFHJKSDAFH KJSADHFJSDFKHJ
							SDFKDFJSDFKUFJSAKHJGKL HGDSFFHJG HGDSFFH JGJKDELJ GDKFJGKHKJJSD
							FBJSDABBF JKSAHKJFCABSDFJURBSD IUFHJSDIUFHJKSDAFHKJSAD HFJSDFKHJS
						</p>
						<button className='px-8 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors shadow-lg'>
							Hướng dẫn tham gia
						</button>
					</div>
				</div>
			</div>

			{/* Talent */}
			<div className='h-dvh w-dvw pointer-events-none relative z-10 section'>
				<div className='h-full center text-black'> Info </div>
			</div>
		</div>
	)
}

export default LandingPage

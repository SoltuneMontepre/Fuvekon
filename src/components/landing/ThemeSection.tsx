import React from 'react'
import CraneBanner from './theme_section/CraneBanner'
import { useGSAP } from '@gsap/react'
import gsap from '@/common/gsap'
import { useTranslations } from 'next-intl'

interface ThemeSectionProps {
	prefersReducedMotion?: boolean
}

const ThemeSection = ({ prefersReducedMotion = false }: ThemeSectionProps) => {
	const t = useTranslations('landing')

	useGSAP(() => {
		if (prefersReducedMotion) {
			gsap.set('.crane', { clearProps: 'all' })
			gsap.set('.crane-reversed', { clearProps: 'all' })
			return
		}

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: '.crane',
				start: 'top bottom',
				end: 'bottom top',
				scrub: 2,
				invalidateOnRefresh: true,
			},
		})

		tl.fromTo(
			'.crane',
			{
				x: '100%',
				force3D: true,
			},
			{
				x: '0%',
				force3D: true,
				ease: 'none',
			}
		)

		const tlReversed = gsap.timeline({
			scrollTrigger: {
				trigger: '.crane-reversed',
				start: 'top bottom',
				end: 'bottom top',
				scrub: 2,
				invalidateOnRefresh: true,
			},
		})

		tlReversed.fromTo(
			'.crane-reversed',
			{
				x: '-100%',
				force3D: true,
			},
			{
				x: '0%',
				force3D: true,
				ease: 'none',
			}
		)
	}, [prefersReducedMotion])

	return (
		<div className='h-dvh w-dvw flex flex-col pointer-events-none relative z-10 section theme-section'>
			<CraneBanner />
			<div className='flex h-full md:h-auto md:grid md:grid-cols-2 grow text-xl font-thin'>
				<div className='flex justify-center text-text flex-col gap-5 bg-slate-950/60 md:bg-transparent md:bg-gradient-to-r from-slate-950/60 via-70% via-slate-900/60 to-90% to-transparent'>
					<div className='mx-10 md:px-0'>
						<h3 className='md:ml-[25%]'>
							<span className='text-5xl hidden md:inline text-primary'>
								{t('theme.theme')}
							</span>
							<br />
							<span className='text-7xl font-bold'>{t('theme.title')}</span>
						</h3>
						<div className='md:ml-[25%] md:mx-auto mt-5 mx-2 text-xl text-wrap flex-1 max-h-[40%] max-w-full'>
							{t('theme.description_1')}
							<br />
							{t('theme.description_2')}
						</div>
					</div>
				</div>
				<div />
			</div>
			<CraneBanner reversed />
		</div>
	)
}

export default ThemeSection

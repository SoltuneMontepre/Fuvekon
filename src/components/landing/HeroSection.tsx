'use client'

import ThemeTitle from '@/components/landing/hero_section/ThemeTitle'
import { useTranslations } from 'next-intl'
import React, { Suspense } from 'react'

const Background = React.lazy(() => import('@/components/ui/Background'))

const HeroSection = () => {
	const t = useTranslations('landing')

	return (
		<div className='h-screen w-dvw relative pointer-events-none z-0 section'>
			<div className='absolute inset-0 pointer-events-none'>
				<Suspense
					fallback={
						<div className='absolute inset-0 bg-black' aria-hidden='true' />
					}
				>
					<Background mascot animated />
				</Suspense>
			</div>
			<ThemeTitle className='absolute left-1/2 bottom-[14%] -translate-x-1/2 z-50 md:w-2xl max-w-[90vw] min-w-[220px] h-auto pointer-events-auto' />
			<p className='absolute left-1/2 -translate-x-1/2 bottom-[10%] z-50 text-primary/70 text-sm md:text-base lg:text-lg font-semibold pointer-events-auto select-none invert-text'>
				{t('suggestion')}
			</p>
		</div>
	)
}

export default HeroSection

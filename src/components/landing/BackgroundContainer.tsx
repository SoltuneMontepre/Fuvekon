import React from 'react'
import Lang from './Animated/Lang'

const BackgroundContainer = (): React.ReactElement => {
	return (
		<div className='w-dvw flex h-dvh absolute top-0 mx-auto -z-10 overflow-hidden center-width-cap'>
			<img
				className='landing-bg z-0 w-dvw h-dvh overflow-visible'
				src='/images/landing/bg_1.webp'
				alt='background'
			/>
			<img
				className='landing-bg z-10 right-[5%] top-0 w-dvw h-dvh overflow-visible filter drop-shadow-[0_0_30px_#ff9518] '
				src='/images/landing/bg_2.webp'
				alt='dragon'
			/>
			<img
				className='landing-bg z-20 bottom-0 h-dvh left-0 overflow-visible'
				src='/images/landing/bg_3.webp'
				alt='stones'
			/>
			<img
				className='landing-bg z-30 bottom-0 h-dvh w-dvw overflow-visible'
				src='/images/landing/bg_4.webp'
				alt='flowers'
			/>
			<Lang />
			<img
				className='landing-bg z-50 bottom-0 h-dvh w-dvw overflow-visible pointer-events-none'
				src='/images/landing/background_6a.webp'
				alt='flowers_6a'
			/>
			<img
				className='landing-bg z-40 bottom-0 h-dvh w-dvw overflow-visible'
				src='/images/landing/background_6b.webp'
				alt='flowers_6b'
			/>
		</div>
	)
}

export default React.memo(BackgroundContainer)

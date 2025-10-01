import React from 'react'

const BackgroundContainer = (): React.ReactElement => {
	return (
		<div className='w-dvw flex h-dvh absolute top-0 mx-auto -z-10 overflow-hidden max-w-[2200px]'>
			<img
				className='landing-bg z-0 w-dvw h-dvh'
				src='/images/landing/bg_1.webp'
				alt='background'
			/>
			<img
				className='landing-bg z-10 right-[5%] top-0 w-dvw overflow-visible'
				src='/images/landing/bg_2.webp'
				alt='dragon'
			/>
			<img
				className='landing-bg z-20 bottom-0 h-dvh left-0 overflow-visible'
				src='/images/landing/bg_3.webp'
				alt='stones'
			/>
			<img
				className='landing-bg z-30 bottom-0 h-dvh sm:w-dvw overflow-visible'
				src='/images/landing/bg_4.webp'
				alt='flowers'
			/>
			<img
				className='landing-bg z-40 h-[80%] top-[25%] right-[20%] overflow-visible'
				src='/images/landing/bg_5.webp'
				alt='lang'
			/>
			{/* <img
				className='landing-bg z-50 bottom-0 w-dvw'
				src='/images/landing/bg_6.webp'
				alt='foreground_flowers'
			/> */}
		</div>
	)
}

export default React.memo(BackgroundContainer)

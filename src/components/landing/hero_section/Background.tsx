/* eslint-disable @next/next/no-img-element */
import React from 'react'

const Background = (): React.ReactElement => {
	return (
		<>
			<img
				className='landing-bg z-0 w-dvw h-dvh overflow-visible'
				src='/images/landing/bg_1.webp'
				alt='background'
			/>
			<img
				className='landing-bg z-10 right-[5%] top-0 h-dvh overflow-visible'
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
		</>
	)
}

export default Background

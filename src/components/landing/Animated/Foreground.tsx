import React from 'react'

const Foreground = (): React.ReactElement => {
	return (
		<>
			<img
				className='landing-bg z-50 bottom-0 right-0 overflow-visible pointer-events-none'
				src='/images/landing/background_6a.webp'
				alt='flowers_6a'
			/>
			<img
				className='landing-bg z-40 bottom-0 left-0 overflow-visible'
				src='/images/landing/background_6b.webp'
				alt='flowers_6b'
			/>
		</>
	)
}

export default Foreground

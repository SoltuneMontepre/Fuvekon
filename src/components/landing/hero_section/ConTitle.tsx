/* eslint-disable @next/next/no-img-element */
import React from 'react'

const ConTitle = (): React.ReactElement => {
	return (
		<img
			className='landing-bg min-w-[40%] max-w-[95%] z-[999] -translate-x-1/2 left-1/2 top-2/3 pointer-events-none'
			src='/images/landing/title.webp'
			alt='title'
			width={800}
		/>
	)
}

export default ConTitle

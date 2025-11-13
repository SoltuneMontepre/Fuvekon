import Image from 'next/image'
import React from 'react'

const ScrollBar = ({ onClick }: { onClick: () => void }) => {
	return (
		<button
			className='scroll-bar border-0 p-0 bg-transparent cursor-pointer'
			onClick={onClick}
			aria-label='Toggle scroll content'
		>
			<Image
				src='/components/scroll-bar.png'
				alt=''
				width={1728}
				height={64}
				className='max-w-full h-auto'
			/>
		</button>
	)
}

export default ScrollBar

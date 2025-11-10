import Image from 'next/image'
import React from 'react'

const ScrollBar = ({ onClick }: { onClick: () => void }) => {
	return (
		<Image
			className='scroll-bar'
			src='/components/scroll-bar.png'
			alt='scroll bar'
			width={1728}
			height={64}
			onClick={onClick}
		/>
	)
}

export default ScrollBar

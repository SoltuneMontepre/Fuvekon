import Image from 'next/image'
import React from 'react'

const Dragon = ({ className }: { className?: string }) => {
	return (
		<Image
			className={`landing-bg ${className ?? ''}`}
			src='/assets/bg-dragon.png'
			alt='dragon-background-image'
			priority
			fill
		/>
	)
}

export default Dragon

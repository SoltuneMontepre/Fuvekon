import Image from 'next/image'
import React from 'react'

const Moon = ({ className }: { className?: string }) => {
	return (
		<Image
			className={`landing-bg ${className}`}
			src='/assets/bg-moon.png'
			alt='moon-background-image'
			priority
			fill
		/>
	)
}

export default Moon

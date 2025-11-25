import Image from 'next/image'
import React from 'react'

const ForegroundFlower = ({ className }: { className?: string }) => {
	return (
		<Image
			className={`landing-bg ${className}`}
			src='/assets/fg-flower.png'
			alt='foreground-flower-image'
			priority
			fill
		/>
	)
}

export default ForegroundFlower

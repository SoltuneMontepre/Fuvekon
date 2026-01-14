import Image from 'next/image'
import React from 'react'

const ForegroundFlower = ({ className }: { className?: string }) => {
	return (
		<Image
			className={`landing-bg ${className ?? ''}`}
			src='/assets/fg-flower.webp'
			alt='foreground-flower-image'
			priority
			fill
		/>
	)
}

export default ForegroundFlower

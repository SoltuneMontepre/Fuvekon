import Image from 'next/image'
import React from 'react'

const ForegroundFoliage = ({ className }: { className?: string }) => {
	return (
		<Image
			className={`landing-bg ${className ?? ''}`}
			src='/assets/fg-foliage.png'
			alt='foreground-foliage-background-image'
			priority
			fill
		/>
	)
}

export default ForegroundFoliage

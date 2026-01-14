import Image from 'next/image'
import React from 'react'

const ForegroundFoliage = ({ className }: { className?: string }) => {
	return (
		<Image
			className={`landing-bg scale-[1.14] ${className ?? ''}`}
			src='/assets/fg-foliage.webp'
			alt='foreground-foliage-bg-image'
			priority
			fill
		/>
	)
}

export default ForegroundFoliage

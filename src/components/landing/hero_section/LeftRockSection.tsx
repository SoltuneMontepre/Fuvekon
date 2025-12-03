import Image from 'next/image'
import React from 'react'

const LeftRockSection = ({ className }: { className?: string }) => {
	return (
		<Image
			className={`landing-bg ${className ?? ''}`}
			src='/assets/bg-rock-left.webp'
			alt='left-rock-background-image'
			priority
			fill
		/>
	)
}

export default LeftRockSection

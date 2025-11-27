import Image from 'next/image'
import React from 'react'

const RightRockSection = ({ className }: { className?: string }) => {
	return (
		<Image
			className={`landing-bg ${className ?? ''}`}
			src='/assets/bg-rock-right.png'
			alt='right-rock-background-image'
			priority
			fill
		/>
	)
}

export default RightRockSection

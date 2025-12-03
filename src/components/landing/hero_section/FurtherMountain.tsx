import Image from 'next/image'
import React from 'react'

const FurtherMountain = ({ className }: { className?: string }) => {
	return (
		<Image
			className={`landing-bg ${className ?? ''}`}
			src='/assets/bg-darkrock.webp'
			alt='further-mountain-background-image'
			priority
			fill
		/>
	)
}

export default FurtherMountain

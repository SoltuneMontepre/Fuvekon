import Image from 'next/image'
import React from 'react'

const BaseBackground = ({ className }: { className?: string }) => {
	return (
		<Image
			className={`landing-bg w-dvw h-dvh ${className}`}
			src='/assets/bg-base.png'
			alt='base-background-image'
			priority
			fill
		/>
	)
}

export default BaseBackground

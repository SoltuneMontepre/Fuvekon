'use client'
import Image from 'next/image'
import React from 'react'

const StaticBirds = ({ className }: { className?: string }) => {
	return (
		<Image
			id='birds'
			src='/assets/static-bird.webp'
			alt='Static Bird'
			fill
			sizes='(max-width: 1000px) 70vh, 50vw'
			priority
			className={`landing-bg ${className ?? ''}`}
		/>
	)
}

export default StaticBirds

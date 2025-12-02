'use client'
import Image from 'next/image'
import React from 'react'

const StaticBirds = ({ className }: { className?: string }) => {
	return (
		<Image
			id='birds'
			src='/assets/static-bird.png'
			alt='Static Bird'
			fill
			sizes='(max-width: 768px) 50vw, 35vw'
			priority
			className={`landing-bg ${className ?? ''}`}
		/>
	)
}

export default StaticBirds

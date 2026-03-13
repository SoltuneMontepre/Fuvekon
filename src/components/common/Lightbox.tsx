'use client'

import Image from 'next/image'
import React from 'react'

interface LightboxProps {
	src: string | null
	alt?: string
	onClose: () => void
}

const Lightbox = ({ src, alt = '', onClose }: LightboxProps) => {
	if (!src) return null

	return (
		<div
			className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 pointer-events-auto'
			onClick={onClose}
		>
			<button
				type='button'
				className='absolute top-4 right-4 text-white/70 hover:text-white text-4xl leading-none'
				onClick={onClose}
				aria-label='Close'
			>
				&times;
			</button>
			<div
				className='relative max-w-[90vw] max-h-[90vh] w-full h-full'
				onClick={e => e.stopPropagation()}
			>
				<Image src={src} alt={alt} fill className='object-contain' />
			</div>
		</div>
	)
}

export default Lightbox

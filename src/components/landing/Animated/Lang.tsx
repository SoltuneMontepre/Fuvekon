import React, { useRef } from 'react'
import { gsap } from 'gsap'

const Lang = (): React.ReactElement => {
	const ref = useRef<HTMLImageElement | null>(null)
	const overlayRef = useRef<HTMLDivElement | null>(null)

	const handleMouseEnter = () => {
		if (!ref.current) return
		gsap.to(ref.current, {
			duration: 0.5,
			scale: 1.05,
			y: -10,
			ease: 'power1.inOut',
		})

		gsap.to(overlayRef.current, {
			duration: 0.5,
			opacity: 0.6,
			ease: 'power1.inOut',
		})
	}

	const handleMouseLeave = () => {
		if (!ref.current) return
		gsap.to(ref.current, {
			duration: 0.5,
			scale: 1,
			y: 0,
			ease: 'power1.inOut',
		})

		gsap.to(overlayRef.current, {
			duration: 0.5,
			opacity: 0,
			ease: 'power1.inOut',
		})
	}

	return (
		<>
			<img
				ref={ref}
				className='landing-bg z-50 h-[80%] sm:left-[20%] pointer-events-auto -bottom-[13%] w-[60%] overflow-visible cursor-pointer'
				src='/images/landing/bg_5.webp'
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				alt='lang'
			/>
			<div
				ref={overlayRef}
				className='w-full h-screen bg-gray-950 opacity-0 z-40 backdrop-blur-sm'
			/>
		</>
	)
}

export default Lang

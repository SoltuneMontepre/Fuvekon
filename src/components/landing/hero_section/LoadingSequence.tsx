'use client'
import React from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

const LoadingSequence = () => {
	const ref = React.useRef(null)

	useGSAP(() => {
		const tl = gsap.timeline()
		const split1 = SplitText.create('#welcome-text', { type: 'chars' })

		tl.from(ref.current, {
			opacity: 1,
			ease: 'power1.inOut',
		})
			.from(split1.chars, {
				opacity: 0,
				y: -10,
				duration: 1,
				stagger: 0.04,
				zIndex: 10,
				ease: 'power2.inOut',
			})
			.to(ref.current, {
				duration: 1,
				opacity: 0,
				delay: 2,
				zIndex: -10,
			})
	}, [])

	return (
		<div
			className='fixed top-0 pointer-events-none left-0 inset-0 center w-screen h-screen bg-black'
			ref={ref}
		>
			<span
				id='welcome-text'
				className='text-white animate-pulse text-center text-5xl'
			>
				Figuring things out...
			</span>
		</div>
	)
}

export default LoadingSequence

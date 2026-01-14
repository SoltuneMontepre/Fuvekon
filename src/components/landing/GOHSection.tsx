'use client'

import React from 'react'
import DrumImage from './DrumImage'
import gsap from '@/common/gsap'
import { useGSAP } from '@gsap/react'
import Image from 'next/image'
import { GOH_DETAILS } from '@/config/app'

const GOHSection = ({ disable }: { disable?: boolean }) => {
	const [isEnterLeft, setIsEnterLeft] = React.useState(false)
	const [isEnterRight, setIsEnterRight] = React.useState(false)

	useGSAP(() => {
		gsap.set('#drum-left', { x: '-100%' })
		gsap.set('#drum-right', { x: '100%' })
		gsap.set('.goh-left-image, .goh-right-image', { filter: 'brightness(0.6)' })
		gsap.set('#goh-info-box', { opacity: 0, scale: 0.8 })
	}, [])

	const handleLeftHover = (isEnter: boolean) => {
		setIsEnterLeft(isEnter)

		gsap.to('#drum-left', {
			x: isEnter ? '0%' : '-100%',
			duration: 0.8,
			ease: 'power3.out',
			scale: isEnter ? 1.2 : 1,
		})

		gsap.to('.goh-left-image', {
			scale: isEnter ? 1.15 : 1,
			filter: isEnter ? 'brightness(1.2)' : 'brightness(0.2)',
			duration: 0.5,
			ease: 'power2.out',
		})

		gsap.to('#goh-info-box', {
			opacity: isEnter ? 1 : 0,
			scale: isEnter ? 1 : 0.8,
			duration: 0.5,
			delay: isEnter ? 0.3 : 0,
			ease: 'power2.out',
		})
	}

	const handleRightHover = (isEnter: boolean) => {
		setIsEnterRight(isEnter)

		gsap.to('#drum-right', {
			x: isEnter ? '0%' : '100%',
			duration: 0.8,
			ease: 'power3.out',
			scale: isEnter ? 1.2 : 1,
		})

		gsap.to('.goh-right-image', {
			scale: isEnter ? 1.15 : 1,
			filter: isEnter ? 'brightness(1.2)' : 'brightness(0.2)',
			duration: 0.5,
			ease: 'power2.out',
			y: isEnter ? -10 : 0,
		})

		gsap.to('#goh-info-box', {
			opacity: isEnter ? 1 : 0,
			scale: isEnter ? 1 : 0.8,
			duration: 0.5,
			delay: isEnter ? 0.3 : 0,
			ease: 'power2.out',
		})
	}

	const selectedGOH = isEnterLeft
		? GOH_DETAILS.first
		: isEnterRight
		? GOH_DETAILS.second
		: null

	return (
		<>
			{/* Info Box */}
			<div
				id='goh-info-box'
				className={`absolute flex h-screen w-screen items-center z-40 pointer-events-none text-white ${
					isEnterLeft ? 'pl-[50%]' : null
				} ${isEnterRight ? 'pl-[20%]' : null}`}
			>
				<h3>
					<span className='text-5xl font-thin text-primary'>
						{selectedGOH?.name}
					</span>
					<br />
					<span className='text-7xl font-bold'>{selectedGOH?.description}</span>
				</h3>
			</div>

			<div
				id='goh-section'
				className='h-dvh grid-cols-2 grid w-dvw relative z-10 section overflow-hidden'
			>
				{/* Left Character Box */}
				<div className='h-full w-full relative flex items-end justify-center'>
					<div className='absolute inset-0 z-0'>
						<DrumImage id='drum-left' isEnter={isEnterLeft} disable={disable} />
					</div>
					<div className='goh-left z-30 relative pointer-events-auto cursor-pointer w-full h-full translate-y-1/3'>
						<div className='relative w-full h-full'>
							<Image
								src={GOH_DETAILS.first.image}
								onMouseEnter={() => handleLeftHover(true)}
								onMouseLeave={() => handleLeftHover(false)}
								alt='Character 1'
								fill
								className='goh-left-image object-contain drop-shadow-2xl'
							/>
						</div>
					</div>
				</div>

				{/* Right Character Box */}
				<div className='h-full w-full relative flex items-end justify-center'>
					<div className='absolute inset-0 z-0'>
						<DrumImage
							id='drum-right'
							reversed
							isEnter={isEnterRight}
							disable={disable}
						/>
					</div>
					<div className='goh-right z-30 relative pointer-events-auto cursor-pointer w-full h-full translate-y-1/3'>
						<div className='relative w-full h-full'>
							<Image
								onMouseEnter={() => handleRightHover(true)}
								onMouseLeave={() => handleRightHover(false)}
								src='/images/landing/goh-image-1.png'
								alt='Character 2'
								fill
								className='goh-right-image object-contain drop-shadow-2xl'
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default GOHSection

'use client'

import React, { useEffect } from 'react'
import DrumImage from './DrumImage'
import gsap from '@/common/gsap'
import { useGSAP } from '@gsap/react'
import Image from 'next/image'
import { GOH_DETAILS } from '@/config/app'

interface GOHSectionProps {
	activeCharacter?: 0 | 1 | 2
}

const GOHSection = ({ activeCharacter = 0 }: GOHSectionProps) => {
	useGSAP(() => {
		gsap.set('#drum-left', { x: '-100%' })
		gsap.set('#drum-right', { x: '100%' })
		gsap.set('.goh-left-image, .goh-right-image', { filter: 'brightness(0.2)' })
		gsap.set('#goh-info-box', { opacity: 0, scale: 0.8 })
	}, [])

	useEffect(() => {
		const isLeft = activeCharacter === 1
		const isRight = activeCharacter === 2
		const showInfo = activeCharacter !== 0

		gsap.to('#drum-left', {
			x: isLeft ? '0%' : '-100%',
			duration: 0.8,
			ease: 'power3.out',
			scale: isLeft ? 1.2 : 1,
			overwrite: 'auto',
		})

		gsap.to('.goh-left-image', {
			scale: isLeft ? 1.15 : 1,
			filter: isLeft ? 'brightness(1.2)' : 'brightness(0.2)',
			duration: 0.5,
			ease: 'power2.out',
			overwrite: 'auto',
		})

		gsap.to('#drum-right', {
			x: isRight ? '0%' : '100%',
			duration: 0.8,
			ease: 'power3.out',
			scale: isRight ? 1.2 : 1,
			overwrite: 'auto',
		})

		gsap.to('.goh-right-image', {
			scale: isRight ? 1.15 : 1,
			filter: isRight ? 'brightness(1.2)' : 'brightness(0.2)',
			duration: 0.5,
			ease: 'power2.out',
			y: isRight ? -10 : 0,
			overwrite: 'auto',
		})

		gsap.to('#goh-info-box', {
			opacity: showInfo ? 1 : 0,
			scale: showInfo ? 1 : 0.8,
			duration: 0.5,
			delay: showInfo ? 0.3 : 0,
			ease: 'power2.out',
			overwrite: 'auto',
		})
	}, [activeCharacter])

	const selectedGOH =
		activeCharacter === 1
			? GOH_DETAILS.first
			: activeCharacter === 2
				? GOH_DETAILS.second
				: null

	return (
		<>
			{/* Info Box */}
			<div
				id='goh-info-box'
				className={`absolute flex h-screen w-screen items-start mt-32 md:my-auto md:items-center md:justify-normal justify-center z-40 pointer-events-none text-white ${
					activeCharacter === 1 ? 'md:pl-[50%]' : ''
				} ${activeCharacter === 2 ? 'md:pl-[20%]' : ''}`}
			>
				<h3 className='text-center md:text-left'>
					<span className='text-2xl md:text-5xl font-thin text-primary'>
						{selectedGOH?.name}
					</span>
					<br />
					<span className='text-4xl md:text-7xl font-bold'>
						{selectedGOH?.description}
					</span>
				</h3>
			</div>

			<div
				id='goh-section'
				className='h-dvh grid-cols-2 grid w-dvw relative z-10 section overflow-hidden'
			>
				{/* Left Character Box */}
				<div className='h-full w-full relative flex items-end justify-center'>
					<div className='absolute inset-0 z-0'>
						<DrumImage id='drum-left' isEnter={activeCharacter === 1} />
					</div>
					<div className='goh-left z-30 relative pointer-events-none w-full h-full translate-y-1/3'>
						<div className='relative w-full h-full'>
							<Image
								src={GOH_DETAILS.first.image}
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
							isEnter={activeCharacter === 2}
						/>
					</div>
					<div className='goh-right z-30 relative pointer-events-none w-full h-full translate-y-1/3'>
						<div className='relative w-full h-full'>
							<Image
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

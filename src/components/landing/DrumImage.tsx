import gsap from '@/common/gsap'
import { useGSAP } from '@gsap/react'
import Image from 'next/image'
import React from 'react'

const DrumImage = ({
	id,
	reversed,
	isEnter,
}: {
	id: string
	reversed?: boolean
	isEnter?: boolean
}) => {
	useGSAP(() => {
		if (!isEnter) return
		const tl = gsap.timeline()

		// Smooth roll-in then conscdistent spin
		tl.fromTo(
			`#${id}`,
			{ rotate: 0 },
			{
				rotate: reversed ? -360 : 360,
				duration: 1,
			}
		)

		tl.fromTo(
			`#drum-line`,
			{ rotate: 0 },
			{
				rotate: reversed ? 360 : -360,
				duration: 1,
			},
			0
		)

		tl.to(`#${id}`, {
			rotate: reversed ? -720 : 720,
			duration: 40,
			ease: 'linear',
			repeat: -1,
		})

		tl.to(
			`#drum-line`,
			{
				rotate: reversed ? 720 : -720,
				duration: 40,
				ease: 'linear',
				repeat: -1,
			},
			0
		)
	}, [isEnter, id, reversed])

	return (
		<div
			id={id}
			className='z-0 h-dvh w-dvh bg-[#0b100b] opacity-95 relative rounded-full [filter:brightness(1.2)] pointer-events-none flex items-center justify-center'
		>
			<Image
				src='/assets/common/drum_pattern.webp'
				alt='Drum'
				width={400}
				height={400}
				className='h-dvh w-dvh scale-90 bg-[#3d5f41] rounded-full'
			/>
			<div
				id='drum-line'
				className='absolute m-auto -z-10 h-1 w-dvh bg-amber-200'
			/>
			<div className='absolute bg-[#3d5f41] scale-90 rounded-full' />
		</div>
	)
}

export default DrumImage

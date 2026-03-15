import gsap from '@/common/gsap'
import { useGSAP } from '@gsap/react'
import Image from 'next/image'
import React from 'react'

const DrumImage = ({
	id,
	reversed,
	isEnter,
	className,
	reducedMotion = false,
}: {
	id: string
	reversed?: boolean
	reducedMotion?: boolean
	isEnter?: boolean
	className?: string
}) => {
	useGSAP(() => {
		if (!isEnter || reducedMotion) return
		const spinnerId = `#${id}-spinner`
		const tl = gsap.timeline()

		tl.fromTo(
			spinnerId,
			{ rotate: 0 },
			{ rotate: reversed ? -360 : 360, duration: 1 }
		)
		tl.fromTo(
			`#${id}-line`,
			{ rotate: 0 },
			{ rotate: reversed ? 360 : -360, duration: 1 },
			0
		)
		tl.to(spinnerId, {
			rotate: reversed ? -720 : 720,
			duration: 40,
			ease: 'linear',
			repeat: -1,
		})
		tl.to(
			`#${id}-line`,
			{
				rotate: reversed ? 720 : -720,
				duration: 40,
				ease: 'linear',
				repeat: -1,
			},
			0
		)
	}, [isEnter, id, reversed, reducedMotion])

	return (
		<div
			id={id}
			className={`z-0 h-dvh w-dvh relative pointer-events-none ${className ?? ''}`}
		>
			<Image
				id={`${id}-line`}
				alt='Drum back'
				className='absolute h-dvh w-dvh scale-90 rounded-full'
				src='/assets/drum/outer.png'
				width={400}
				height={400}
			/>
			<div
				id={`${id}-spinner`}
				className='absolute inset-0 bg-[#0b100b] rounded-full [filter:brightness(1.2)] flex items-center justify-center'
			>
				<Image
					src='/assets/drum/inner.png'
					alt='Drum'
					width={400}
					height={400}
					className='h-dvh w-dvh scale-90 bg-[#3d5f41] rounded-full'
				/>
				<div className='absolute bg-[#3d5f41] scale-90 rounded-full' />
			</div>
		</div>
	)
}

export default DrumImage

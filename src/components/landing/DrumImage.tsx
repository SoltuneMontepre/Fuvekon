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
			<div
				id={`${id}-spinner`}
				className='absolute inset-0 bg-[#0b100b] opacity-95 rounded-full [filter:brightness(1.2)] flex items-center justify-center'
			>
				<Image
					src='/assets/common/drum_pattern.webp'
					alt='Drum'
					width={400}
					height={400}
					className='h-dvh w-dvh scale-90 bg-[#3d5f41] rounded-full'
				/>
				<div
					id={`${id}-line`}
					className='absolute m-auto -z-10 h-1 w-dvh bg-amber-200'
				/>
				<div className='absolute bg-[#3d5f41] scale-90 rounded-full' />
			</div>

			<svg
				className='absolute inset-0 w-full h-full pointer-events-none'
				viewBox='0 0 100 100'
				aria-hidden='true'
			>
				<path
					id={`${id}-arc-0`}
					d='M 50 50 L 50 5 A 45 45 0 0 1 88.97 72.5 Z'
					fill='rgba(255,255,255,0.18)'
					opacity='0'
				/>
				<path
					id={`${id}-arc-1`}
					d='M 50 50 L 88.97 72.5 A 45 45 0 0 1 11.03 72.5 Z'
					fill='rgba(255,255,255,0.18)'
					opacity='0'
				/>
				<path
					id={`${id}-arc-2`}
					d='M 50 50 L 11.03 72.5 A 45 45 0 0 1 50 5 Z'
					fill='rgba(255,255,255,0.18)'
					opacity='0'
				/>
			</svg>
		</div>
	)
}

export default DrumImage

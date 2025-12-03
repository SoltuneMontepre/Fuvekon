'use client'

import BaseBackground from '@/components/landing/hero_section/BaseBackground'
import ForegroundFoliage from '@/components/landing/hero_section/ForegroundFoliage'
import ForegroundFlower from '@/components/landing/hero_section/ForegroundFlower'
import FurtherMountain from '@/components/landing/hero_section/FurtherMountain'
import LeftRockSection from '@/components/landing/hero_section/LeftRockSection'
import Mascot from '@/components/landing/hero_section/Mascot'
import Moon from '@/components/landing/hero_section/Moon'
import RightRockSection from '@/components/landing/hero_section/RightRockSection'
import StaticBirds from '@/components/landing/hero_section/StaticBirds'
import { useLandingPageAnimation } from '@/hooks/animation/useLandingPageAnimation'
import React from 'react'

interface BackgroundProps {
	mascot?: boolean
	title?: boolean
	animated?: boolean
}

const Background = ({ mascot = false, animated = false }: BackgroundProps) => {
	const {
		containerRef,
		backgroundLayerRef,
		furtherMountainRef,
		leftRockRef,
		rightRockRef,
		middleLayerRef,
		foregroundFlowerRef,
		foregroundFoliageRef,
	} = useLandingPageAnimation(animated)

	return (
		<div
			ref={containerRef}
			id='background-container'
			className='fixed inset-0 h-dvh w-dvw flex items-center justify-center select-none overflow-hidden pointer-events-auto'
		>
			<div className='relative w-full h-full'>
				<div className='absolute inset-0 flex items-center justify-center overflow-visible'>
					<div className='relative w-full h-full overflow-visible'>
						{/* Background Layer - Sky and Base */}
						<div
							ref={backgroundLayerRef}
							className='absolute inset-0 overflow-visible'
						>
							<BaseBackground />
							<Moon className='-translate-x-1/7 -translate-y-30 overflow-visible' />
						</div>
						{/* Further Mountain Layer */}
						<div
							ref={furtherMountainRef}
							className='absolute inset-0 overflow-visible'
						>
							<FurtherMountain className='translate-x-10 -translate-y-30 overflow-visible' />
						</div>
						{/* Left Rock Layer */}
						<div
							ref={leftRockRef}
							className='absolute inset-0 overflow-visible'
						>
							<LeftRockSection className='left-0 top-0 overflow-visible' />
						</div>
						{/* Right Rock Layer */}
						<div
							ref={rightRockRef}
							className='absolute inset-0 overflow-visible'
						>
							<RightRockSection className='overflow-visible' />
						</div>
						{/* Middle Layer - Characters */}
						<div
							ref={middleLayerRef}
							className='absolute inset-0 overflow-visible'
						>
							<StaticBirds className='scale-[0.5] -translate-y-[30%] -translate-x-[3%] z-0 overflow-visible' />
							{mascot && (
								<Mascot className='scale-[0.7] overflow-visible drop-shadow-[0_25px_20px_rgba(0,0,0,0.4)] [filter:drop-shadow(0_25px_35px_rgba(0,0,0,0.4))_drop-shadow(0_10px_15px_rgba(0,0,0,0.25))]' />
							)}
						</div>
						{/* Foreground Flower Layer */}
						<div
							ref={foregroundFlowerRef}
							className='absolute inset-0 overflow-visible pointer-events-none'
						>
							<ForegroundFlower className='overflow-visible scale-[1.13]' />
						</div>
						{/* Foreground Foliage Layer */}
						<div
							ref={foregroundFoliageRef}
							className='absolute inset-0 overflow-visible pointer-events-none'
						>
							<ForegroundFoliage className='object-[70%] overflow-visible' />
						</div>{' '}
					</div>
				</div>
			</div>
		</div>
	)
}

export default Background

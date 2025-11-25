'use client'

import BaseBackground from '@/components/landing/hero_section/BaseBackground'
import ForegroundFoliage from '@/components/landing/hero_section/ForegroudFoliage'
import ForegroundFlower from '@/components/landing/hero_section/ForegroundFlower'
import FurtherMountain from '@/components/landing/hero_section/FurtherMountain'
import LeftRockSection from '@/components/landing/hero_section/LeftRockSection'
import Mascot from '@/components/landing/hero_section/Mascot'
import Moon from '@/components/landing/hero_section/Moon'
import RightRockSection from '@/components/landing/hero_section/RightRockSection'
import StaticBirds from '@/components/landing/hero_section/StaticBirds'
import ThemeTitle from '@/components/landing/hero_section/ThemeTitle'
import React, { useRef } from 'react'
import gsap from '@/common/gsap'
import { useGSAP } from '@gsap/react'

interface BackgroundProps {
	mascot?: boolean
	title?: boolean
}

const Background = ({ mascot = false, title = false }: BackgroundProps) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const backgroundLayerRef = useRef<HTMLDivElement>(null)
	const middleLayerRef = useRef<HTMLDivElement>(null)
	const foregroundLayerRef = useRef<HTMLDivElement>(null)

	useGSAP(
		() => {
			// Set perspective for 3D effect
			gsap.set(containerRef.current, {
				perspective: 1000,
				transformStyle: 'preserve-3d',
			})

			// Set initial 3D properties for layers
			gsap.set(
				[
					backgroundLayerRef.current,
					middleLayerRef.current,
					foregroundLayerRef.current,
				],
				{
					transformStyle: 'preserve-3d',
				}
			)

			// Create optimized quickTo functions for smooth parallax
			// Background layer - slowest and most subtle
			const bgRotateX = gsap.quickTo(backgroundLayerRef.current, 'rotationX', {
				duration: 0.8,
				ease: 'power2.out',
			})
			const bgRotateY = gsap.quickTo(backgroundLayerRef.current, 'rotationY', {
				duration: 0.8,
				ease: 'power2.out',
			})

			// Middle layer - medium speed and intensity
			const midRotateX = gsap.quickTo(middleLayerRef.current, 'rotationX', {
				duration: 0.6,
				ease: 'power2.out',
			})
			const midRotateY = gsap.quickTo(middleLayerRef.current, 'rotationY', {
				duration: 0.6,
				ease: 'power2.out',
			})

			// Foreground layer - fastest and most pronounced
			const fgRotateX = gsap.quickTo(foregroundLayerRef.current, 'rotationX', {
				duration: 0.4,
				ease: 'power2.out',
			})
			const fgRotateY = gsap.quickTo(foregroundLayerRef.current, 'rotationY', {
				duration: 0.4,
				ease: 'power2.out',
			})

			// Mouse move handler
			const handleMouseMove = (e: MouseEvent) => {
				if (!containerRef.current) return

				const rect = containerRef.current.getBoundingClientRect()
				const centerX = rect.width / 2
				const centerY = rect.height / 2

				// Calculate mouse position relative to center (-1 to 1)
				const x = (e.clientX - rect.left - centerX) / centerX
				const y = (e.clientY - rect.top - centerY) / centerY

				// Apply different rotation intensities for strong depth effect
				// Background layer - minimal movement (furthest, 2° max rotation)
				bgRotateY(x * 2)
				bgRotateX(-y * 2)

				// Middle layer - moderate movement (10° max rotation)
				midRotateY(x * 10)
				midRotateX(-y * 10)

				// Foreground layer - dramatic movement (closest, 20° max rotation)
				fgRotateY(x * 20)
				fgRotateX(-y * 20)
			}

			// Mouse leave handler to reset positions
			const handleMouseLeave = () => {
				bgRotateX(0)
				bgRotateY(0)
				midRotateX(0)
				midRotateY(0)
				fgRotateX(0)
				fgRotateY(0)
			}

			// Add event listeners
			const container = containerRef.current
			container?.addEventListener('mousemove', handleMouseMove)
			container?.addEventListener('mouseleave', handleMouseLeave)

			// Cleanup function
			return () => {
				container?.removeEventListener('mousemove', handleMouseMove)
				container?.removeEventListener('mouseleave', handleMouseLeave)
			}
		},
		{ scope: containerRef }
	)

	return (
		<div
			ref={containerRef}
			className='fixed inset-0 h-dvh w-dvw flex items-center justify-center select-none'
		>
			<div className='relative w-full h-full max-w-[100vw] max-h-[100vh] overflow-hidden'>
				<div className='absolute inset-0 flex items-center justify-center'>
					<div className='relative w-full h-full scale-[min(100vw/1920,100vh/1080)] origin-center'>
						{/* Background Layer */}
						<div ref={backgroundLayerRef} className='absolute inset-0'>
							<BaseBackground />
							<Moon className='-translate-x-1/7 -translate-y-30' />
							<FurtherMountain className='translate-x-10 -translate-y-30' />
							<LeftRockSection className='left-0 top-0' />
							<RightRockSection />
						</div>

						{/* Middle Layer */}
						<div ref={middleLayerRef} className='absolute inset-0'>
							<StaticBirds className='scale-35 -translate-y-1/3  top-0 overflow-visible max-w-1/2 translate-x-[70%]' />
							{mascot && <Mascot className='scale-70' />}
						</div>

						{/* Foreground Layer */}
						<div ref={foregroundLayerRef} className='absolute inset-0'>
							<ForegroundFlower />
							<ForegroundFoliage className='object-[70%]' />
						</div>

						{title && (
							<ThemeTitle className='absolute left-1/2 bottom-[10%] -translate-x-1/2 md:w-2xl max-w-[90vw] min-w-[220px] h-auto' />
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default Background

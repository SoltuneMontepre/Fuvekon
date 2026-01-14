import { useRef } from 'react'
import gsap from '@/common/gsap'
import { useGSAP } from '@gsap/react'

interface UseLandingPageAnimationReturn {
	containerRef: React.RefObject<HTMLDivElement | null>
	backgroundLayerRef: React.RefObject<HTMLDivElement | null>
	furtherMountainRef: React.RefObject<HTMLDivElement | null>
	leftRockRef: React.RefObject<HTMLDivElement | null>
	rightRockRef: React.RefObject<HTMLDivElement | null>
	middleLayerRef: React.RefObject<HTMLDivElement | null>
	foregroundFlowerRef: React.RefObject<HTMLDivElement | null>
	foregroundFoliageRef: React.RefObject<HTMLDivElement | null>
}

export const useLandingPageAnimation = (
	animated: boolean
): UseLandingPageAnimationReturn => {
	const containerRef = useRef<HTMLDivElement>(null)
	const backgroundLayerRef = useRef<HTMLDivElement>(null)
	const furtherMountainRef = useRef<HTMLDivElement>(null)
	const leftRockRef = useRef<HTMLDivElement>(null)
	const rightRockRef = useRef<HTMLDivElement>(null)
	const middleLayerRef = useRef<HTMLDivElement>(null)
	const foregroundFlowerRef = useRef<HTMLDivElement>(null)
	const foregroundFoliageRef = useRef<HTMLDivElement>(null)

	useGSAP(
		() => {
			if (!animated) return

			gsap.set(containerRef.current, {
				perspective: 1500,
				transformStyle: 'preserve-3d',
				force3D: true,
			})

			gsap.set(backgroundLayerRef.current, {
				transformStyle: 'preserve-3d',
				z: -150,
				force3D: true,
			})
			gsap.set(furtherMountainRef.current, {
				transformStyle: 'preserve-3d',
				z: -100,
				force3D: true,
			})
			gsap.set(leftRockRef.current, {
				transformStyle: 'preserve-3d',
				z: -60,
				force3D: true,
			})
			gsap.set(rightRockRef.current, {
				transformStyle: 'preserve-3d',
				z: -50,
				force3D: true,
			})
			gsap.set(middleLayerRef.current, {
				transformStyle: 'preserve-3d',
				z: 0,
				force3D: true,
			})
			gsap.set(foregroundFlowerRef.current, {
				transformStyle: 'preserve-3d',
				z: 75,
				force3D: true,
			})
			gsap.set(foregroundFoliageRef.current, {
				transformStyle: 'preserve-3d',
				z: 150,
				force3D: true,
			})

			// Set initial scale for mascot
			gsap.set('#mascot', {
				scale: 0.7,
				force3D: true,
			})

			const bgTranslateY = gsap.quickTo(backgroundLayerRef.current, 'y', {
				duration: 1.2,
				ease: 'power3.out',
				force3D: true,
			})

			const furtherMtnRotateX = gsap.quickTo(
				furtherMountainRef.current,
				'rotationX',
				{
					duration: 1.1,
					ease: 'power3.out',
					force3D: true,
				}
			)
			const furtherMtnRotateY = gsap.quickTo(
				furtherMountainRef.current,
				'rotationY',
				{
					duration: 1.1,
					ease: 'power3.out',
					force3D: true,
				}
			)
			const furtherMtnTranslateX = gsap.quickTo(
				furtherMountainRef.current,
				'x',
				{
					duration: 1.1,
					ease: 'power3.out',
					force3D: true,
				}
			)
			const furtherMtnTranslateY = gsap.quickTo(
				furtherMountainRef.current,
				'y',
				{
					duration: 1.1,
					ease: 'power3.out',
					force3D: true,
				}
			)

			const leftRockRotateX = gsap.quickTo(leftRockRef.current, 'rotationX', {
				duration: 0.95,
				ease: 'power3.out',
				force3D: true,
			})
			const leftRockRotateY = gsap.quickTo(leftRockRef.current, 'rotationY', {
				duration: 0.95,
				ease: 'power3.out',
				force3D: true,
			})
			const leftRockTranslateX = gsap.quickTo(leftRockRef.current, 'x', {
				duration: 0.95,
				ease: 'power3.out',
				force3D: true,
			})
			const leftRockTranslateY = gsap.quickTo(leftRockRef.current, 'y', {
				duration: 0.95,
				ease: 'power3.out',
				force3D: true,
			})

			const rightRockRotateX = gsap.quickTo(rightRockRef.current, 'rotationX', {
				duration: 0.9,
				ease: 'power3.out',
				force3D: true,
			})
			const rightRockRotateY = gsap.quickTo(rightRockRef.current, 'rotationY', {
				duration: 0.9,
				ease: 'power3.out',
				force3D: true,
			})
			const rightRockTranslateX = gsap.quickTo(rightRockRef.current, 'x', {
				duration: 0.9,
				ease: 'power3.out',
				force3D: true,
			})
			const rightRockTranslateY = gsap.quickTo(rightRockRef.current, 'y', {
				duration: 0.9,
				ease: 'power3.out',
				force3D: true,
			})

			const midRotateX = gsap.quickTo(middleLayerRef.current, 'rotationX', {
				duration: 0.8,
				ease: 'power3.out',
				force3D: true,
			})
			const midRotateY = gsap.quickTo(middleLayerRef.current, 'rotationY', {
				duration: 0.8,
				ease: 'power3.out',
				force3D: true,
			})
			const midTranslateX = gsap.quickTo(middleLayerRef.current, 'x', {
				duration: 0.8,
				ease: 'power3.out',
				force3D: true,
			})
			const midTranslateY = gsap.quickTo(middleLayerRef.current, 'y', {
				duration: 0.8,
				ease: 'power3.out',
				force3D: true,
			})

			const flowerRotateX = gsap.quickTo(
				foregroundFlowerRef.current,
				'rotationX',
				{
					duration: 0.6,
					ease: 'power3.out',
					force3D: true,
				}
			)
			const flowerRotateY = gsap.quickTo(
				foregroundFlowerRef.current,
				'rotationY',
				{
					duration: 0.6,
					ease: 'power3.out',
					force3D: true,
				}
			)
			const flowerTranslateX = gsap.quickTo(foregroundFlowerRef.current, 'x', {
				duration: 0.6,
				ease: 'power3.out',
				force3D: true,
			})
			const flowerTranslateY = gsap.quickTo(foregroundFlowerRef.current, 'y', {
				duration: 0.6,
				ease: 'power3.out',
				force3D: true,
			})

			const foliageRotateX = gsap.quickTo(
				foregroundFoliageRef.current,
				'rotationX',
				{
					duration: 0.4,
					ease: 'power3.out',
					force3D: true,
				}
			)
			const foliageRotateY = gsap.quickTo(
				foregroundFoliageRef.current,
				'rotationY',
				{
					duration: 0.4,
					ease: 'power3.out',
					force3D: true,
				}
			)
			const foliageTranslateX = gsap.quickTo(
				foregroundFoliageRef.current,
				'x',
				{
					duration: 0.4,
					ease: 'power3.out',
					force3D: true,
				}
			)
			const foliageTranslateY = gsap.quickTo(
				foregroundFoliageRef.current,
				'y',
				{
					duration: 0.4,
					ease: 'power3.out',
					force3D: true,
				}
			)

			const handleMouseMove = (e: MouseEvent) => {
				if (!containerRef.current) return

				const rect = containerRef.current.getBoundingClientRect()
				const centerX = rect.width / 2
				const centerY = rect.height / 2

				const x = (e.clientX - rect.left - centerX) / centerX
				const y = (e.clientY - rect.top - centerY) / centerY

				bgTranslateY(y * 8)

				furtherMtnRotateY(x * 4)
				furtherMtnRotateX(-y * 4)
				furtherMtnTranslateX(x * 12)
				furtherMtnTranslateY(y * 12)

				leftRockRotateY(x * 6)
				leftRockRotateX(-y * 6)
				leftRockTranslateX(x * 18)
				leftRockTranslateY(y * 18)

				rightRockRotateY(x * 8)
				rightRockRotateX(-y * 8)
				rightRockTranslateX(x * 22)
				rightRockTranslateY(y * 22)

				midRotateY(x * 10)
				midRotateX(-y * 10)
				midTranslateX(x * 25)
				midTranslateY(y * 25)

				flowerRotateY(x * 18)
				flowerRotateX(-y * 18)
				flowerTranslateX(x * 40)
				flowerTranslateY(y * 40)

				foliageRotateY(x * 20)
				foliageRotateX(-y * 20)
				foliageTranslateX(x * 50)
				foliageTranslateY(y * 50)
			}

			const handleMouseLeave = () => {
				bgTranslateY(0)
				furtherMtnRotateX(0)
				furtherMtnRotateY(0)
				furtherMtnTranslateX(0)
				furtherMtnTranslateY(0)
				leftRockRotateX(0)
				leftRockRotateY(0)
				leftRockTranslateX(0)
				leftRockTranslateY(0)
				rightRockRotateX(0)
				rightRockRotateY(0)
				rightRockTranslateX(0)
				rightRockTranslateY(0)
				midRotateX(0)
				midRotateY(0)
				midTranslateX(0)
				midTranslateY(0)
				flowerRotateX(0)
				flowerRotateY(0)
				flowerTranslateX(0)
				flowerTranslateY(0)
				foliageRotateX(0)
				foliageRotateY(0)
				foliageTranslateX(0)
				foliageTranslateY(0)
			}

			const container = containerRef.current
			container?.addEventListener('mousemove', handleMouseMove)
			container?.addEventListener('mouseleave', handleMouseLeave)

			return () => {
				container?.removeEventListener('mousemove', handleMouseMove)
				container?.removeEventListener('mouseleave', handleMouseLeave)
			}
		},
		{ scope: containerRef, dependencies: [animated] }
	)

	return {
		containerRef,
		backgroundLayerRef,
		furtherMountainRef,
		leftRockRef,
		rightRockRef,
		middleLayerRef,
		foregroundFlowerRef,
		foregroundFoliageRef,
	}
}

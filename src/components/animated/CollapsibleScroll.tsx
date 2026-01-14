'use client'
import { useGSAP } from '@gsap/react'
import React, { useState } from 'react'
import gsap from '@/common/gsap'
import ScrollBar from '../common/scroll/ScrollBar'

export type CollapsibleScrollProps = {
	children: React.ReactNode
	initialOpen?: boolean
	className?: string
}

const CollapsibleScroll = ({
	className,
	children,
	initialOpen = false,
}: CollapsibleScrollProps) => {
	const [isOpen, setIsOpen] = useState(initialOpen)

	useGSAP(() => {
		if (!isOpen) {
			gsap.to('.scroll-body', {
				height: 0,
				duration: 0.6,
				ease: 'power3.inOut',
				opacity: 0,
				outlineStyle: 'none',
				outlineWidth: 0,
			})
		} else {
			gsap.to('.scroll-body', {
				height: 'auto',
				duration: 0.8,
				ease: 'elastic.out(1, 0.5)',
				opacity: 1,
			})
		}
	}, [isOpen])

	return (
		<div className={`flex flex-col ${className}`}>
			<ScrollBar onClick={() => setIsOpen(!isOpen)} />
			<div>
				<div className='scroll-body bg-secondary w-[95%] mx-auto relative'>
					<div className='relative overflow-x-clip'>
						<div
							className='absolute inset-0 w-full h-full bg-paper'
							aria-hidden
						/>
						<div
							className="absolute inset-0 w-full h-full bg-bg-secondary [-webkit-mask-image:url('/images/landing/drum_pattern.webp')] [mask-image:url('/images/landing/drum_pattern.webp')] [-webkit-mask-repeat:repeat-y] [mask-repeat:repeat-y] [-webkit-mask-size:cover] [mask-size:cover] [-webkit-mask-position:center] [mask-position:center]"
							aria-hidden
						/>
						<div className='relative mx-9 space-y-2 text-wrap'>{children}</div>
					</div>
				</div>
				<ScrollBar onClick={() => setIsOpen(!isOpen)} />
			</div>
		</div>
	)
}

export default CollapsibleScroll

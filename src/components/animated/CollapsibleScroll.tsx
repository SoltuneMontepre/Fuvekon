'use client'
import React, { useState } from 'react'
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

	return (
		<div className={`flex flex-col ${className}`}>
			<ScrollBar onClick={() => setIsOpen(!isOpen)} />
			<div
				className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 invisible h-0 overflow-hidden'}`}
			>
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

'use client'
import React, { useState } from 'react'
import ScrollBar from '../common/scroll/ScrollBar'

export type CollapsibleScrollProps = {
	children: React.ReactNode
	initialOpen?: boolean
	openable?: boolean
	className?: string
}

const CollapsibleScroll = ({
	className,
	children,
	initialOpen = false,
	openable = false,
}: CollapsibleScrollProps) => {
	const [isOpen, setIsOpen] = useState(initialOpen)

	const toggle = () => {
		if (openable) setIsOpen(prev => !prev)
	}

	return (
		<div className={`flex flex-col ${className ?? ''}`}>
			<ScrollBar onClick={toggle} disabled={!openable} />
			<div
				className={`grid flex-1 transition-[grid-template-rows,opacity] duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
			>
				<div className='overflow-hidden min-h-0 flex flex-col'>
					<div className='scroll-body bg-secondary w-[95%] mx-auto relative flex-1'>
						<div className='relative overflow-x-clip h-full'>
							<div
								className='absolute inset-0 w-full h-full bg-paper z-10 border-x-[2px] border-secondary pointer-events-none'
								aria-hidden
							/>
							<div
								className="absolute inset-0 w-full h-full bg-bg-secondary z-10 [-webkit-mask-image:url('/images/landing/drum_pattern.webp')] [mask-image:url('/images/landing/drum_pattern.webp')] [-webkit-mask-repeat:repeat-y] [mask-repeat:repeat-y] [-webkit-mask-size:cover] [mask-size:cover] [-webkit-mask-position:center] [mask-position:center]"
								aria-hidden
							/>
							<div className='relative mx-9 space-y-2 text-wrap z-10 h-full flex flex-col'>
								{children}
							</div>
						</div>
					</div>
					<ScrollBar onClick={toggle} disabled={!openable} />
				</div>
			</div>
		</div>
	)
}

export default CollapsibleScroll

'use client'

import { NavData, useNavDatas } from '@/config/nav'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'

const NavButtons = ({
	className,
}: {
	className?: string
}): React.ReactElement => {
	const buttons = useNavDatas()

	return (
		<>
			<div
				className={`lg:flex hidden underline underline-offset-5 items-center gap-0 ${className}`}
			>
				{buttons.map(button =>
					button.to && !button.children ? (
						<NavButton key={button.to ?? button.label} button={button} />
					) : (
						<CollapsedNavButton key={button.label} button={button} />
					)
				)}
			</div>
		</>
	)
}

const NavButton = ({ button }: { button: NavData }) => {
	const [shouldPrefetch, setShouldPrefetch] = useState(false)

	return (
		<Link
			className='nav-bg text-bg-secondary flex-1 text-center z-30 hover:bg-secondary/20 transition-colors duration-200'
			href={button.to ?? '/'}
			prefetch={shouldPrefetch ? true : false}
			onMouseEnter={() => setShouldPrefetch(true)}
		>
			{'\u00a0\u00a0\u00a0\u00a0' + button.label + '\u00a0\u00a0\u00a0\u00a0'}
		</Link>
	)
}

const CollapsedNavButton = ({ button }: { button: NavData }) => {
	const [isOpen, setIsOpen] = useState(false)
	const wrapperRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				wrapperRef.current &&
				!wrapperRef.current.contains(e.target as Node)
			) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return (
		<div ref={wrapperRef} className='relative flex-1'>
			<button
				className='nav-bg w-full text-center text-bg-secondary underline hover:bg-secondary/20 transition-colors duration-200 underline-offset-5 uppercase inline-flex items-center justify-center gap-1'
				onClick={() => setIsOpen(v => !v)}
				aria-haspopup='true'
				aria-expanded={isOpen}
			>
				{'\u00a0\u00a0\u00a0' + button.label + '\u00a0'}
				<FiChevronDown
					className={`w-3 h-3 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
				/>
				{'\u00a0\u00a0'}
			</button>

			{isOpen && (
				<div className='absolute left-1/2 -translate-x-1/2 top-full mt-2 min-w-[11rem] rounded-xl shadow-lg border border-white/10 backdrop-blur-md bg-text-primary/90 flex flex-col overflow-hidden z-50'>
					{button.children?.map(child => (
						<Link
							key={child.label}
							href={child.to ?? '/'}
							onClick={() => setIsOpen(false)}
							className='px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors duration-150 whitespace-nowrap'
						>
							{child.label}
						</Link>
					))}
				</div>
			)}
		</div>
	)
}
export default NavButtons

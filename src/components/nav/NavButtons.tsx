'use client'

import { NavData, useNavDatas } from '@/config/nav'
import Link from 'next/link'
import React, { useState } from 'react'

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
			className='nav-button flex-1 text-center z-30 hover:bg-scroll-cover/20 transition-colors duration-200'
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

	return (
		<div className='relative flex-1'>
			<button
				className='nav-button w-full text-center underline hover:bg-scroll-cover/20 transition-colors duration-200 underline-offset-5 uppercase'
				onClick={() => setIsOpen(!isOpen)}
			>
				{'\u00a0\u00a0\u00a0\u00a0' + button.label + '\u00a0\u00a0\u00a0\u00a0'}
			</button>
			{isOpen && (
				<div className='absolute w-full bg-scroll-cover/20 transition-colors duration-200 rounded-2xl flex flex-col gap-1'>
					{button.children &&
						button.children.map(child => (
							<NavButton key={child.label} button={child} />
						))}
				</div>
			)}
		</div>
	)
}
export default NavButtons

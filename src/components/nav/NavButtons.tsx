'use client'

import { NavData, useNavDatas } from '@/config/nav'
import Link, { useLinkStatus } from 'next/link'
import React, { useCallback, useEffect, useRef, useState } from 'react'

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
			<NavButtonInner label={button.label} />
		</Link>
	)
}

const NavButtonInner = ({ label }: { label: string }) => {
	const { pending } = useLinkStatus()
	return (
		<span
			className={`transition-opacity duration-150 ${pending ? 'opacity-50' : 'opacity-100'}`}
		>
			{'\u00a0\u00a0\u00a0\u00a0' + label + '\u00a0\u00a0\u00a0\u00a0'}
		</span>
	)
}

const CollapsedNavButton = ({ button }: { button: NavData }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })
	const buttonRef = useRef<HTMLButtonElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const handleToggle = useCallback(() => {
		if (!isOpen && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect()
			setDropdownPos({ top: rect.bottom + 4, left: rect.left })
		}
		setIsOpen(v => !v)
	}, [isOpen])

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as Node
			if (
				!buttonRef.current?.contains(target) &&
				!dropdownRef.current?.contains(target)
			) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return (
		<div className='relative flex-1'>
			<button
				ref={buttonRef}
				className='nav-bg w-full text-center text-bg-secondary underline hover:bg-secondary/20 transition-colors duration-200 underline-offset-5 uppercase'
				onClick={handleToggle}
			>
				{'\u00a0\u00a0\u00a0\u00a0' + button.label + '\u00a0\u00a0\u00a0\u00a0'}
			</button>

			{isOpen && (
				<div
					ref={dropdownRef}
					style={{ top: dropdownPos.top, left: dropdownPos.left }}
					className='fixed bg-secondary/20 backdrop-blur rounded-2xl flex flex-col gap-1 z-[9999] min-w-[10rem]'
				>
					{button.children?.map(child => (
						<NavButton key={child.label} button={child} />
					))}
				</div>
			)}
		</div>
	)
}
export default NavButtons

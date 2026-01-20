'use client'

import React, { ReactNode, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon } from 'lucide-react'
import { IconType } from 'react-icons'
import { useGSAP } from '@gsap/react'
import gsap from '@/common/gsap'
import Image from 'next/image'

export type SidebarItem = {
	label: string
	href?: string
	icon?: LucideIcon | IconType
	badge?: string | number
	onClick?: () => void
	disabled?: boolean
}

export type SidebarSection = {
	title?: string
	items: SidebarItem[]
}

export type SidebarProps = {
	sections: SidebarSection[]
	className?: string
	logo?: ReactNode
	footer?: ReactNode
}

const SideBar = ({
	sections,
	className = '',
	// logo,
	footer,
}: SidebarProps): React.ReactElement => {
	const pathname = usePathname()
	const sidebarRef = useRef<HTMLElement>(null)

	useGSAP(
		() => {
			if (sidebarRef.current) {
				gsap.fromTo(
					sidebarRef.current,
					{
						y: -1000,
						opacity: 0,
					},
					{
						y: -100,
						opacity: 1,
						duration: 0.8,
						ease: 'elastic.out(0.8, 1.5)',
					}
				)
			}
		},
		{ scope: sidebarRef }
	)

	const isActive = (item: SidebarItem): boolean => {
		if (item.href && pathname) {
			return pathname === item.href || pathname.startsWith(item.href + '/')
		}
		return false
	}

	return (
		<aside
			id='sidebar'
			ref={sidebarRef}
			className={`flex flex-col h-[90%]  bg-main border-r-10 border-r-[154C5B] border-l-10 border-l-[154C5B]  ${className}`}
			style={{
				backgroundImage: 'url(/images/sidebar/sidebarBG.png)',
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
			}}
			aria-label='Sidebar Navigation'
		>

			<div className='fixed bottom-0 translate-y-1/2 w-[140%] left-[-20%]'>
				<Image
					src='/images/sidebar/sidebarScrollThing.png'
					alt='Sidebar Background'
					width={409}
					height={64}
					draggable={false}
					className=''
				/>
			</div>
			
			
			{/* Navigation Sections */}
			<nav
				id='sidebar-nav'
				className='sidebar-nav flex flex-col items-center justify-center w-full h-full py-6 space-y-3'
			>
				{sections.map((section, sectionIndex) => (
					<div key={sectionIndex} className='sidebar-section space-y-1 '>
						
						{section.items.map((item, itemIndex) => (
							<SidebarItemComponent
								key={itemIndex}
								item={item}
								isActive={isActive(item)}
							/>
						))}
					</div>
				))}
			</nav>

			{/* Footer */}
			{footer && (
				<div
					id='sidebar-footer'
					className='sidebar-footer p-4 border-t border-slate-200/30 dark:border-dark-border/30'
				>
					{footer}
				</div>
			)}
		</aside>
	)
}

type SidebarItemComponentProps = {
	item: SidebarItem
	isActive: boolean
}

const SidebarItemComponent = ({
	item,
	isActive,
}: SidebarItemComponentProps): React.ReactElement => {
	const Icon = item.icon

	const handleClick = () => {
		item.onClick?.()
	}

	// Create ID-safe label
	const itemId = item.label.toLowerCase().replace(/\s+/g, '-')

	const content = (
		<>
			{Icon && (
				<Icon
					className='sidebar-item-icon flex-shrink-0 w-30 h-20'
					aria-hidden='true'
				/>
			)}
			<span className='sidebar-item-label flex-1 truncate'>{item.label}</span>
			{item.badge !== undefined && (
				<span className='px-2 py-0.5 text-xs font-medium rounded-full bg-bg text-text-secondary'>
					{item.badge}
				</span>
			)}
		</>
	)

	const baseClasses = `
		sidebar-item flex flex-col items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
		transition-colors duration-150  justify-center shadow-md bg-bg w-full
		${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
		${isActive ? ' text-text-secondary' : 'text-text-secondary hover:bg-bg'}
	`

	if (item.href && !item.disabled) {
		return (
			<Link
				id={`sidebar-item-${itemId}`}
				href={item.href}
				className={baseClasses}
				onClick={handleClick}
				aria-current={isActive ? 'page' : undefined}
			>
				{content}
			</Link>
		)
	}

	return (
		<button
			id={`sidebar-item-${itemId}`}
			onClick={handleClick}
			disabled={item.disabled}
			className={baseClasses + ' text-left'}
		>
			{content}
		</button>
	)
}

export default SideBar

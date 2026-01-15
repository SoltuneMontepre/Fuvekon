'use client'

import React, { ReactNode, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon } from 'lucide-react'
import { IconType } from 'react-icons'
import { useGSAP } from '@gsap/react'
import gsap from '@/common/gsap'

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
	logo,
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
						y: 0,
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
			className={`sidebar sticky top-0 flex flex-col h-fit max-h-[calc(100vh-3rem)] bg-transparent border-none overflow-hidden ${className}`}
			aria-label='Sidebar Navigation'
		>
			{/* Header */}
			{logo && (
				<div
					id='sidebar-header'
					className='sidebar-header flex items-center p-4 border-b border-slate-200 dark:border-dark-border'
				>
					<div className='flex-1'>{logo}</div>
				</div>
			)}

			{/* Navigation Sections */}
			<nav
				id='sidebar-nav'
				className='sidebar-nav flex flex-col items-center justify-center overflow-y-auto py-6 px-4 space-y-3'
			>
				{sections.map((section, sectionIndex) => (
					<div key={sectionIndex} className='sidebar-section space-y-1'>
						{section.title && (
							<h3 className='sidebar-section-title px-3 py-2 text-xs font-semibold text-slate-500 dark:text-dark-text-secondary uppercase tracking-wider'>
								{section.title}
							</h3>
						)}
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
					className='sidebar-item-icon flex-shrink-0 w-5 h-5'
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
		transition-colors duration-150 w-full max-w-[140px] justify-center shadow-md
		${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
		${isActive ? 'bg-bg text-text-secondary' : 'text-text-secondary hover:bg-bg'}
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
			className={baseClasses + ' w-full text-left'}
		>
			{content}
		</button>
	)
}

export default SideBar

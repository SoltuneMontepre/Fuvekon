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
						opacity: 1,
					},
					{
						y: -70,
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
			ref={sidebarRef}
			className={`fixed flex flex-col h-[90%] bg-main border-r border-slate-200 dark:border-dark-border w-[17%] ${className} ml-[10%] `}
			aria-label='Sidebar Navigation'
		>
			{/* Header */}
			{logo && (
				<div className='flex items-center p-4 border-b border-slate-200 dark:border-dark-border'>
					<div className='flex-1'>{logo}</div>
				</div>
			)}

			{/* Navigation Sections */}
			<nav className='flex-1 flex flex-col justify-center overflow-y-auto p-4 space-y-6'>
				{sections.map((section, sectionIndex) => (
					<div key={sectionIndex} className='space-y-1'>
						{section.title && (
							<h3 className='px-3 py-2 text-xs font-semibold text-slate-500 dark:text-dark-text-secondary uppercase tracking-wider'>
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
				{/* Footer */}
				{footer && (
					<div className='p-4 border-t border-slate-200 dark:border-dark-border'>
						{footer}
					</div>
				)}
			</nav>
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

	const content = (
		<>
			{Icon && <Icon className='flex-shrink-0 w-15 h-15' aria-hidden='true' />}
			<span className='flex-1 truncate'>{item.label}</span>
			{item.badge !== undefined && (
				<span className='px-2 py-0.5 text-xs font-medium rounded-full bg-button text-default'>
					{item.badge}
				</span>
			)}
		</>
	)

	const baseClasses = `
		flex flex-col items-center gap-3 px-3 py-2 rounded-lg text-xl font-medium
		transition-colors duration-150 w-40 mx-auto justify-center shadow-md
		${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
		${isActive ? 'bg-button text-default' : 'text-default hover:bg-button'}
	`

	if (item.href && !item.disabled) {
		return (
			<Link
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
			onClick={handleClick}
			disabled={item.disabled}
			className={baseClasses + ' w-full text-left'}
		>
			{content}
		</button>
	)
}

export default SideBar

'use client'

import React, { useState, ReactNode, useRef } from 'react'
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
	children?: SidebarItem[]
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
						y: -60,
						opacity: 1,
						duration: 0.8,
						ease: 'elastic.out(0.5, 1.2)',
					}
				)
			}
		},
		{ scope: sidebarRef }
	)

	const isActive = (item: SidebarItem): boolean => {
		if (item.href) {
			if (pathname === item.href || pathname.startsWith(item.href + '/')) {
				return true
			}
		}
		// Check if any child is active
		if (item.children) {
			return item.children.some(child => isActive(child))
		}
		return false
	}

	return (
		<aside
			ref={sidebarRef}
			className={`fixed flex flex-col h-5/6 bg-white dark:bg-dark-surface border-r border-slate-200 dark:border-dark-border w-64 ${className} ml-50 `}
			aria-label='Sidebar Navigation'
		>
			{/* Header */}
			{logo && (
				<div className='flex items-center p-4 border-b border-slate-200 dark:border-dark-border'>
					<div className='flex-1'>{logo}</div>
				</div>
			)}

			{/* Navigation Sections */}
			<nav className='flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6'>
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
								level={0}
								pathname={pathname}
							/>
						))}
					</div>
				))}
			</nav>

			{/* Footer */}
			{footer && (
				<div className='p-4 border-t border-slate-200 dark:border-dark-border'>
					{footer}
				</div>
			)}
		</aside>
	)
}

type SidebarItemComponentProps = {
	item: SidebarItem
	isActive: boolean
	level: number
	pathname: string
}

const SidebarItemComponent = ({
	item,
	isActive,
	level,
	pathname,
}: SidebarItemComponentProps): React.ReactElement => {
	const hasChildren = item.children && item.children.length > 0
	const childIsActive =
		hasChildren &&
		item.children?.some(child => {
			if (child.href) {
				return pathname === child.href || pathname.startsWith(child.href + '/')
			}
			return false
		})
	const [isExpanded, setIsExpanded] = useState(
		isActive || childIsActive || false
	)
	const Icon = item.icon

	const handleClick = () => {
		if (hasChildren) {
			setIsExpanded(!isExpanded)
		}
		item.onClick?.()
	}

	const content = (
		<>
			{Icon && <Icon className='flex-shrink-0 w-5 h-5' aria-hidden='true' />}
			<span className='flex-1 truncate'>{item.label}</span>
			{item.badge !== undefined && (
				<span className='px-2 py-0.5 text-xs font-medium rounded-full bg-main/10 dark:bg-main/20 text-main dark:text-dark-main'>
					{item.badge}
				</span>
			)}
			{hasChildren && (
				<svg
					className={`w-4 h-4 transition-transform ${
						isExpanded ? 'rotate-90' : ''
					}`}
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M9 5l7 7-7 7'
					/>
				</svg>
			)}
		</>
	)

	const baseClasses = `
		flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
		transition-colors duration-150
		${level > 0 ? 'ml-4' : ''}
		${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
		${
			isActive
				? 'bg-main/10 dark:bg-main/20 text-main dark:text-dark-main'
				: 'text-slate-700 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-card'
		}
	`

	if (item.href && !item.disabled) {
		return (
			<div>
				<Link
					href={item.href}
					className={baseClasses}
					onClick={handleClick}
					aria-current={isActive ? 'page' : undefined}
				>
					{content}
				</Link>
				{hasChildren && isExpanded && (
					<div className='mt-1 ml-4 space-y-1 border-l-2 border-slate-200 dark:border-dark-border pl-4'>
						{item.children?.map((child, childIndex) => {
							const childHref = child.href
							const childActive = childHref
								? pathname === childHref || pathname.startsWith(childHref + '/')
								: false
							return (
								<SidebarItemComponent
									key={childIndex}
									item={child}
									isActive={childActive}
									level={level + 1}
									pathname={pathname}
								/>
							)
						})}
					</div>
				)}
			</div>
		)
	}

	return (
		<div>
			<button
				onClick={handleClick}
				disabled={item.disabled}
				className={baseClasses + ' w-full text-left'}
				aria-expanded={hasChildren ? isExpanded : undefined}
			>
				{content}
			</button>
			{hasChildren && isExpanded && (
				<div className='mt-1 ml-4 space-y-1 border-l-2 border-slate-200 dark:border-dark-border pl-4'>
					{item.children?.map((child, childIndex) => {
						const childHref = child.href
						const childActive = childHref
							? pathname === childHref || pathname.startsWith(childHref + '/')
							: false
						return (
							<SidebarItemComponent
								key={childIndex}
								item={child}
								isActive={childActive}
								level={level + 1}
								pathname={pathname}
							/>
						)
					})}
				</div>
			)}
		</div>
	)
}

export default SideBar

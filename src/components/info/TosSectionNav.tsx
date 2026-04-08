'use client'

import React from 'react'

export type TosNavSection = { id: string; title: string }

export type TosSectionNavProps = {
	groups: {
		headingId: string
		headingLabel: string
		sections: TosNavSection[]
	}[]
}

function shortSectionLabel(fullTitle: string): string {
	const parts = fullTitle.split(' / ').map(s => s.trim())
	return parts.length > 1 ? parts[parts.length - 1]! : fullTitle
}

const TosSectionNav = ({ groups }: TosSectionNavProps): React.ReactElement => {
	const navigateTo = (id: string) => {
		const el = document.getElementById(id)
		if (!el) return
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
		window.history.replaceState(null, '', `#${id}`)
	}

	return (
		<nav
			className='rounded-lg border border-secondary/50 bg-bg-secondary p-3 text-sm lg:sticky lg:top-28 lg:max-h-[min(70vh,calc(100vh-8rem))] lg:shrink-0 lg:w-56 lg:overflow-y-auto'
			aria-label='Mục lục / On this page'
		>
			<p className='mb-2 text-xs font-semibold uppercase tracking-wide text-text-primary'>
				Mục lục / On this page
			</p>
			<ul className='space-y-3'>
				{groups.map(group => (
					<li key={group.headingId}>
						<a
							href={`#${group.headingId}`}
							className='block py-0.5 font-medium text-text-primary hover:text-primary'
							onClick={e => {
								e.preventDefault()
								navigateTo(group.headingId)
							}}
						>
							{group.headingLabel}
						</a>
						<ul className='mt-1 ml-2 space-y-1 border-l border-secondary/60 pl-2'>
							{group.sections.map(s => (
								<li key={s.id}>
									<a
										href={`#${s.id}`}
										className='block py-0.5 leading-snug text-text-secondary hover:text-primary'
										onClick={e => {
											e.preventDefault()
											navigateTo(s.id)
										}}
									>
										{shortSectionLabel(s.title)}
									</a>
								</li>
							))}
						</ul>
					</li>
				))}
			</ul>
		</nav>
	)
}

export default TosSectionNav

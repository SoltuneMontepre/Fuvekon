'use client'

import { useThemeStore } from '@/config/Providers/ThemeProvider'
import { useEffect, useState } from 'react'
import { FiZap, FiZapOff } from 'react-icons/fi'

export default function ReducedMotionToggle() {
	const { prefersReducedMotion, setPrefersReducedMotion } = useThemeStore(
		state => state
	)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return (
			<div className='p-2 w-9 h-9 rounded-lg bg-transparent' aria-hidden='true'>
				<div className='w-5 h-5' />
			</div>
		)
	}

	return (
		<button
			onClick={() => setPrefersReducedMotion(!prefersReducedMotion)}
			className='p-2 rounded-lg bg-transparent hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
			aria-label={
				prefersReducedMotion ? 'Enable animations' : 'Reduce animations'
			}
			title={prefersReducedMotion ? 'Enable animations' : 'Reduce animations'}
		>
			{prefersReducedMotion ? (
				<FiZapOff className='w-5 h-5 text-main' />
			) : (
				<FiZap className='w-5 h-5 text-main' />
			)}
		</button>
	)
}

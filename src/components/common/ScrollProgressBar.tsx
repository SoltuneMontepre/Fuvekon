'use client'

import { useEffect, useRef } from 'react'

export default function ScrollProgressBar() {
	const barRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const update = () => {
			if (!barRef.current) return
			const scrollTop = window.scrollY
			const docHeight =
				document.documentElement.scrollHeight -
				document.documentElement.clientHeight
			const progress = docHeight > 0 ? scrollTop / docHeight : 0
			barRef.current.style.transform = `scaleX(${progress})`
		}

		window.addEventListener('scroll', update, { passive: true })
		return () => window.removeEventListener('scroll', update)
	}, [])

	return (
		<div
			ref={barRef}
			className='fixed top-0 left-0 z-[9999] h-[2px] w-full bg-[#4CAF83] dark:bg-[#6fcfa0] origin-left'
			style={{ transform: 'scaleX(0)' }}
			aria-hidden='true'
		/>
	)
}

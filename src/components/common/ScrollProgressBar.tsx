'use client'

import { useEffect, useState } from 'react'

export default function ScrollProgressBar() {
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		const update = () => {
			const scrollTop = window.scrollY
			const docHeight =
				document.documentElement.scrollHeight - window.innerHeight
			setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
		}

		window.addEventListener('scroll', update, { passive: true })
		return () => window.removeEventListener('scroll', update)
	}, [])

	return (
		<div
			className='fixed top-0 left-0 z-[9999] h-[2px] bg-[#4CAF83] dark:bg-[#6fcfa0] transition-none origin-left'
			style={{ width: `${progress}%` }}
			aria-hidden='true'
		/>
	)
}

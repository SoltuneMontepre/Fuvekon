'use client'

import Background from '@/components/ui/Background'
import React, { useEffect, useState } from 'react'

const AuthPageLayout = ({ children }: { children: React.ReactNode }) => {
	const [isLoaded, setIsLoaded] = useState(false)

	useEffect(() => {
		setIsLoaded(true)
	}, [])

	return (
		<div
			className='absolute inset-0 transition-opacity duration-500 ease-out'
			style={{ opacity: isLoaded ? 1 : 0 }}
		>
			<section className='absolute center inset-0 h-dvh w-dvw px-4 sm:px-6 lg:px-8 z-10'>
				{children}
			</section>
			<Background />
			<div className='absolute inset-0 h-screen w-screen backdrop-blur-sm' />
		</div>
	)
}

export default AuthPageLayout

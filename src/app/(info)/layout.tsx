'use client'
import Footer from '@/components/Footer'
import Background from '@/components/ui/Background'
import { useThemeStore } from '@/config/Providers/ThemeProvider'
import React from 'react'

const InfoLayout = ({ children }: { children: React.ReactNode }) => {
	const prefersReducedMotion = useThemeStore(
		state => state.prefersReducedMotion
	)

	return (
		<>
			<div className='min-h-screen'>{children}</div>
			<Footer />

			<Background animated={!prefersReducedMotion} />
		</>
	)
}

export default InfoLayout

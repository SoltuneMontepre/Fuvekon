'use client'
import Background from '@/components/ui/Background'
import { useThemeStore } from '@/config/Providers/ThemeProvider'
import React from 'react'

const InfoLayout = ({ children }: { children: React.ReactNode }) => {
	const prefersReducedMotion = useThemeStore(
		state => state.prefersReducedMotion
	)

	return (
		<>
			<div>{children}</div>
			<Background animated={!prefersReducedMotion} />
		</>
	)
}

export default InfoLayout

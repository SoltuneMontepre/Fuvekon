import Background from '@/components/ui/Background'
import React from 'react'

const AuthPageLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<section className='absolute center inset-0 h-dvh w-dvw px-4 sm:px-6 lg:px-8 z-10'>
				{children}
			</section>
			<Background />
			<div className='absolute inset-0 h-screen w-screen backdrop-blur-sm' />
		</>
	)
}

export default AuthPageLayout

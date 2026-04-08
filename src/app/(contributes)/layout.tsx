import Footer from '@/components/Footer'
import Background from '@/components/ui/Background'
import React from 'react'

const ContributeLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<div className='min-h-screen'>{children}</div>
			<Footer />
			<Background />
		</>
	)
}

export default ContributeLayout

import Background from '@/components/ui/Background'
import React from 'react'

const FeatureLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<div className='z-10 relative'>{children}</div>
			<Background animated />
		</>
	)
}

export default FeatureLayout

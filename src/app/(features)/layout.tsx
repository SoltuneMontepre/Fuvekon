'use client'

import Background from '@/components/ui/Background'
import AuthGuard from '@/components/auth/AuthGuard'
import React from 'react'

const FeatureLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<AuthGuard>
			<div className='z-10 relative'>{children}</div>
			<Background animated />
		</AuthGuard>
	)
}

export default FeatureLayout

import Background from '@/components/ui/Background'
import React from 'react'

const ContributeLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<div>{children}</div>
			<Background animated />
		</>
	)
}

export default ContributeLayout

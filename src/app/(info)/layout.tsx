import Background from '@/components/ui/Background'
import React from 'react'

const InfoLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<div>{children}</div>
			<Background />
		</>
	)
}

export default InfoLayout

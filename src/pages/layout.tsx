import React from 'react'
import NavBar from '../components/common/NavBar'

const MainLayout = ({
	children,
}: {
	children: React.ReactNode
}): React.ReactElement => {
	return (
		<>
			<NavBar />
			<div>{children}</div>
		</>
	)
}

export default MainLayout

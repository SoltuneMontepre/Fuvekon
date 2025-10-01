import React from 'react'
import NavBar from '../components/common/NavBar'

const MainLayout = ({
	children,
}: {
	children: React.ReactNode
}): React.ReactElement => {
	return (
		<div className='cap-width'>
			<NavBar />
			<main>{children}</main>
		</div>
	)
}

export default MainLayout

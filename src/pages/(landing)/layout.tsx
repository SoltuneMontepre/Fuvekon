import React from 'react'

const MainLayout = ({
	children,
}: {
	children: React.ReactNode
}): React.ReactElement => {
	return (
		<>
			hello 2<div>{children}</div>
		</>
	)
}

export default MainLayout

import React from 'react'

const MainLayout = ({
	children,
}: {
	children: React.ReactNode
}): React.ReactElement => {
	return (
		<>
			hello2
			<div>{children}</div>
		</>
	)
}

export default MainLayout

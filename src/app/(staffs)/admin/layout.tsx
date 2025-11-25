import React from 'react'

type AdminLayoutProps = {
	revenue: React.JSX.Element
	timeline: React.JSX.Element
	children: React.JSX.Element
}

const AdminLayout = ({ revenue, timeline, children }: AdminLayoutProps) => {
	return (
		<>
			<section>{revenue}</section>
			<section>{timeline}</section>
			<section>{children}</section>
		</>
	)
}

export default AdminLayout

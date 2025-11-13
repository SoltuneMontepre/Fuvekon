import React from 'react'

type AdminLayoutProps = {
	revenue: React.JSX.Element
	timeline: React.JSX.Element
}

const AdminLayout = ({ revenue, timeline }: AdminLayoutProps) => {
	return (
		<>
			<section>{revenue}</section>
			<section>{timeline}</section>
		</>
	)
}

export default AdminLayout

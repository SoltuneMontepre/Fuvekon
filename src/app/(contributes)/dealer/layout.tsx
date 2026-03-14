import React from 'react'

type DealerLayoutProps = {
	form: React.ReactNode
	rules: React.ReactNode
}

const DealerLayout = ({ form, rules }: DealerLayoutProps) => {
	return (
		<div className='space-y-12'>
			<section>{rules}</section>
			<section>{form}</section>
		</div>
	)
}

export default DealerLayout

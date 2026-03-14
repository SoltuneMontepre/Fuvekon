import React from 'react'

type TalentLayoutProps = {
	form: React.ReactNode
	rules: React.ReactNode
}

const TalentLayout = ({ form, rules }: TalentLayoutProps) => {
	return (
		<div className='space-y-12'>
			<section>{rules}</section>
			<section>{form}</section>
		</div>
	)
}

export default TalentLayout

import React from 'react'

type TalentLayoutProps = {
	form: React.ReactNode
	rules: React.ReactNode
}

const TalentLayout = ({ form, rules }: TalentLayoutProps) => {
	return (
		<div>
			<section>{rules}</section>
			<section>{form}</section>
		</div>
	)
}

export default TalentLayout

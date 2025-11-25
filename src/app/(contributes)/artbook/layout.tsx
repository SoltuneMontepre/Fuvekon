import React from 'react'

type ArtBookLayoutProps = {
	card: React.ReactNode
	rules: React.ReactNode
}

const ArtBookLayout = ({ card, rules }: ArtBookLayoutProps) => {
	return (
		<div className='space-y-12'>
			<section className='mx-auto max-w-5xl'>{rules}</section>
			<section className='mx-auto max-w-4xl'>{card}</section>
		</div>
	)
}

export default ArtBookLayout

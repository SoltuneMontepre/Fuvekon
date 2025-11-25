import React from 'react'
import Foreground from '../landing/hero_section/Foreground'
import Mascot from '../landing/hero_section/Mascot'
import ConTitle from '../landing/hero_section/ConTitle'
import BackFlowers from '../landing/hero_section/BackFlowers'

interface BackgroundProps {
	mascot?: boolean
	title?: boolean
}

const Background = ({ mascot = false, title = false }: BackgroundProps) => {
	return (
		<div className='fixed w-dvw flex -z-10 h-dvh top-0 mx-auto overflow-hidden center-width-cap select-none'>
			<BackFlowers />
			{mascot && <Mascot />}
			<Foreground />
			{title && <ConTitle />}
		</div>
	)
}

export default Background

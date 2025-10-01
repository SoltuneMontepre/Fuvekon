import React from 'react'
import Background from './hero_section/Background'
import ConTitle from './hero_section/ConTitle'
import Foreground from './hero_section/Foreground'
import Mascot from './hero_section/Mascot'

const HeroSection = (): React.ReactElement => {
	return (
		<div className='w-dvw flex h-dvh absolute top-0 mx-auto -z-10 overflow-hidden center-width-cap select-none'>
			<Background />
			<Mascot />
			<Foreground />
			<ConTitle />
		</div>
	)
}

export default React.memo(HeroSection)

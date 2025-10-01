import React from 'react'
import Mascot from './Animated/Mascot'
import Background from './Animated/Background'
import Foreground from './Animated/Foreground'
import ConTitle from './Animated/ConTitle'

const BackgroundContainer = (): React.ReactElement => {
	return (
		<div className='w-dvw flex h-dvh absolute top-0 mx-auto -z-10 overflow-hidden center-width-cap select-none'>
			<Background />
			<Mascot />
			<Foreground />
			<ConTitle />
		</div>
	)
}

export default React.memo(BackgroundContainer)

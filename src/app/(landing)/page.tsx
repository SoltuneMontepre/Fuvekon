import React, { Suspense } from 'react'
import LoadingSequence from '../../components/landing/hero_section/LoadingSequence'

const BackgroundContainer = React.lazy(
	() => import('../../components/landing/HeroSection')
)

const LandingPage = (): React.JSX.Element => {
	return (
		<>
			<LoadingSequence />
			<Suspense>
				<BackgroundContainer />
			</Suspense>
			hehe
		</>
	)
}

export default LandingPage

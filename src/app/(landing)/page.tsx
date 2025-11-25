'use client'

import Loading from '@/components/common/Loading'
import React, { Suspense } from 'react'
import LoadingSequence from '../../components/landing/hero_section/LoadingSequence'

<<<<<<< Updated upstream
const BackgroundContainer = React.lazy(
	() => import('../../components/landing/HeroSection')
=======
const Background = React.lazy(() =>
	import('@/components/ui/Background').then(module => ({
		default: module.default,
	}))
>>>>>>> Stashed changes
)

const LandingPage = (): React.JSX.Element => {
	return (
		<>
<<<<<<< Updated upstream
			<LoadingSequence />
			<Suspense>
				<BackgroundContainer />
=======
			<Suspense fallback={<Loading />}>
				<Background mascot={true} title={true} />
>>>>>>> Stashed changes
			</Suspense>
		</>
	)
}

export default LandingPage

'use client'

import React, { Suspense } from 'react'
import LoadingSequence from '../../components/landing/hero_section/LoadingSequence'

const BackgroundContainer = React.lazy(
	() => import('../../components/landing/HeroSection')
)

const LandingPage = (): React.JSX.Element => {
	React.useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				const axios = (await import('axios')).default
				const res = await axios.get(
					'https://jzvy6i5raumbzqlprtemb54wai0xdfyp.lambda-url.ap-southeast-1.on.aws/health/db'
				)
				if (!cancelled) console.log('Ping response data:', res?.data)
			} catch (err) {
				console.error('Ping failed', err)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [])
	return (
		<>
			<LoadingSequence />
			<Suspense>
				<BackgroundContainer />
			</Suspense>
		</>
	)
}

export default LandingPage

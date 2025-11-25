'use client'

import Loading from '@/components/common/Loading'
import React, { Suspense } from 'react'

const Background = React.lazy(() =>
	import('@/components/ui/Background').then(module => ({
		default: module.default,
	}))
)

const LandingPage = (): React.JSX.Element => {
	return (
		<>
			<Suspense fallback={<Loading />}>
				<Background mascot={true} title={true} />
			</Suspense>
		</>
	)
}

export default LandingPage

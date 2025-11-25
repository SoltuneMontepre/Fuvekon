'use client'

import React, { Suspense } from 'react'

const Background = React.lazy(() => import('@/components/ui/Background'))

const LandingPage = (): React.JSX.Element => {
	return (
		<>
			<Suspense>
				<Background mascot title />
			</Suspense>
		</>
	)
}

export default LandingPage

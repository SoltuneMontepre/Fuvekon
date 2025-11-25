'use client'

import Loading from '@/components/common/Loading'
import React, { Suspense } from 'react'

const Background = React.lazy(() => import('@/components/ui/Background'))

const LandingPage = (): React.JSX.Element => {
	return (
		<>
			<Suspense fallback={<Loading />}>
				<Background mascot title />
			</Suspense>
		</>
	)
}

export default LandingPage

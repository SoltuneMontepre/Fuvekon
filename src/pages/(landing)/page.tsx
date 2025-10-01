import React, { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import Loading from '../../components/common/Loading'
const BackgroundContainer = React.lazy(
	() => import('../../components/landing/BackgroundContainer')
)

const LandingPage = (): React.JSX.Element => {
	const { t } = useTranslation()

	return (
		<div className='w-dvw h-dvh'>
			{t('welcome')}
			<Suspense fallback={<Loading />}>
				<BackgroundContainer />
			</Suspense>
		</div>
	)
}

export default LandingPage

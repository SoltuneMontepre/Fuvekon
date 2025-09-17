import React from 'react'
import { useTranslation } from 'react-i18next'

const LandingPage = (): React.JSX.Element => {
	const { t } = useTranslation()
	return <div>{t('welcome')}</div>
}

export default LandingPage

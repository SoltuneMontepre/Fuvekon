import React from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../../components/LanguageSwitcher'

const LandingPage = (): React.JSX.Element => {
	const { t } = useTranslation()

	return (
		<div>
			{t('welcome')} <LanguageSwitcher />
		</div>
	)
}

export default LandingPage

import React from 'react'
import { useTranslation } from 'react-i18next'

const LanguageSwitcher = (): React.ReactElement => {
	const { i18n } = useTranslation()

	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng)
	}

	return (
		<div>
			<button onClick={() => changeLanguage('en')}>English</button>
			<button onClick={() => changeLanguage('vi')}>Tiếng Việt</button>
		</div>
	)
}

export default LanguageSwitcher

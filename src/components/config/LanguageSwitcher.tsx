import useLanguage from '@/hooks/config/useLanguage'
import React from 'react'

const LanguageSwitcher = (): React.ReactElement => {
	const { changeLanguage } = useLanguage()

	return (
		<div>
			<button onClick={() => changeLanguage('en')}>English</button>
			<button onClick={() => changeLanguage('vi')}>Tiếng Việt</button>
		</div>
	)
}

export default LanguageSwitcher

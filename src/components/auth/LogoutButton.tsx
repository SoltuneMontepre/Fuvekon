import { useTranslations } from 'next-intl'
import React from 'react'

const LogoutButton = (): React.ReactElement => {
	const t = useTranslations('auth')

	return <div>{t('logout')}</div>
}

export default LogoutButton

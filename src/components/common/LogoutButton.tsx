import React from 'react'
import { useTranslation } from 'react-i18next'

const LogoutButton = (): React.ReactElement => {
	const { t } = useTranslation()

	return <div>{t('common.logout')}</div>
}

export default LogoutButton

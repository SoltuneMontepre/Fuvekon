import { useTranslations } from 'next-intl'
import React from 'react'
import { useLogout } from '@/hooks/services/auth/useLogout'

const LogoutButton = (): React.ReactElement => {
	const t = useTranslations('auth')
	const logoutMutation = useLogout()

	const handleLogout = () => {
		logoutMutation.mutate()
	}

	return (
		<button
			onClick={handleLogout}
			disabled={logoutMutation.isPending}
			className='text-white hover:text-gray-300 transition-colors disabled:opacity-50'
		>
			{logoutMutation.isPending ? t('loggingOut') : t('logout')}
		</button>
	)
}

export default LogoutButton

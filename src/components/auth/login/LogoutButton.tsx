'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import { useRouter } from 'next/navigation'
import { useLogout } from '@/hooks/services/auth/useLogout'

const LogoutButton = (): React.ReactElement => {
	const t = useTranslations('auth')
	const router = useRouter()
	const logoutMutation = useLogout()

	const handleLogout = () => {
		logoutMutation.mutate(undefined, {
			onSuccess: () => {
				router.push('/login')
			},
		})
	}

	return (
		<button
			onClick={handleLogout}
			disabled={logoutMutation.isPending}
			className='flex flex-col items-center gap-3 px-3 py-2 rounded-lg text-xl font-medium transition-colors duration-150 w-40 mx-auto justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed'
		>
			<span className='flex-1 truncate'>
				{logoutMutation.isPending
					? t('loggingOut') || 'Logging out...'
					: t('logout')}
			</span>
		</button>
	)
}

export default LogoutButton

'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import { useRouter } from 'next/navigation'
import { useLogout } from '@/hooks/services/auth/useLogout'

const LogoutButton = (): React.ReactElement => {
	const t = useTranslations('auth')
	const router = useRouter()
	const logoutMutation = useLogout()

	const handleLogout = async () => {
		await logoutMutation.mutateAsync(undefined)
		router.replace('/login')
	}

	return (
		<button
			id='logout-button'
			className='logout-button flex flex-col items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 w-full max-w-[140px] mx-auto justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-md'
			onClick={handleLogout}
			disabled={logoutMutation.isPending}
		>
			<span id='logout-button-text' className='logout-button-text flex-1 truncate'>
				{logoutMutation.isPending
					? t('loggingOut') || 'Logging out...'
					: t('logout')}
			</span>
		</button>
	)
}

export default LogoutButton

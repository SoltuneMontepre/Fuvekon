import { CircleUserRound } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'

const LoginButton = (): React.ReactElement => {
	const { t } = useTranslation()

	return (
		<NavLink to='/login' className='center'>
			<span className='hidden md:block'>{t('common.login')}</span>
			<span className='block md:hidden'>
				<CircleUserRound size={30} />
			</span>
		</NavLink>
	)
}

export default LoginButton

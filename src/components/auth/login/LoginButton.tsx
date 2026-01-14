import { useTranslations } from 'next-intl'
import { CircleUserRound } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const LoginButton = (): React.ReactElement => {
	const t = useTranslations('auth')

	return (
		<Link
			id='login-button'
			href='/login'
			className='login-button center'
		>
			<span id='login-button-text' className='login-button-text hidden md:block'>
				{t('login')}
			</span>
			<span id='login-button-icon' className='login-button-icon block md:hidden'>
				<CircleUserRound size={30} />
			</span>
		</Link>
	)
}

export default LoginButton

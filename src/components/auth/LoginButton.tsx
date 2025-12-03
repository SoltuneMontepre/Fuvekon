import { useTranslations } from 'next-intl'
import { CircleUserRound } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const LoginButton = (): React.ReactElement => {
	const t = useTranslations('auth')

	return (
		<Link href='/login' className='center'>
			<span className='hidden lg:block'>{t('login')}</span>
			<span className='block lg:hidden'>
				<CircleUserRound size={30} />
			</span>
		</Link>
	)
}

export default LoginButton

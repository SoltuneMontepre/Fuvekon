import React from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'

export type NavData = {
	label: string
	to: string
}

const NavButtons = ({
	className,
}: {
	className?: string
}): React.ReactElement => {
	const { t } = useTranslation()

	const navDatas: NavData[] = [
		{
			label: t('nav.register'),
			to: '/register',
		},
		{
			label: t('nav.contributes'),
			to: '/contributes',
		},
		{
			label: t('nav.about'),
			to: '/about',
		},
	]

	return (
		<div
			className={`flex justify-center bg-black underline underline-offset-5 text-center ${className}`}
		>
			{navDatas.map(navData => (
				<NavLink
					key={navData.to}
					className='flex-1 content-center text-nowrap'
					to={navData.to}
				>
					{'\u00a0\u00a0\u00a0\u00a0' +
						navData.label +
						'\u00a0\u00a0\u00a0\u00a0'}
				</NavLink>
			))}
		</div>
	)
}

export default NavButtons

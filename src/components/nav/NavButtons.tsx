import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'

export type NavData = {
	label: string
	to: string
}

const NavButtons = ({
	className,
}: {
	className?: string
}): React.ReactElement => {
	const t = useTranslations('nav')

	const navDatas: NavData[] = [
		{
			label: t('register'),
			to: '/register',
		},
		{
			label: t('tickets'),
			to: '/tickets',
		},
		{
			label: t('contributes'),
			to: '/contributes',
		},
		{
			label: t('about'),
			to: '/about',
		},
	]

	return (
		<div
			className={`flex justify-center bg-black underline underline-offset-5 text-center ${className}`}
		>
			{navDatas.map(navData => (
				<Link
					key={navData.to}
					className='flex-1 content-center text-nowrap'
					href={navData.to}
				>
					{'\u00a0\u00a0\u00a0\u00a0' +
						navData.label +
						'\u00a0\u00a0\u00a0\u00a0'}
				</Link>
			))}
		</div>
	)
}

export default NavButtons

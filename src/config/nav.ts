import { useTranslations } from 'next-intl'

export type NavData = {
	label: string
	to?: string
	children?: NavData[]
}

const useNavDatas = (): NavData[] => {
	const t = useTranslations('nav')

	return [
		{
			label: t('ticket'),
			to: '/register',
		},
		{
			label: t('contributes'),
			children: [
				{ label: t('talent'), to: '/talent' },
				{ label: t('panel'), to: '/panel' },
				{ label: t('volunteer'), to: '/volunteer' },
				{ label: t('artbook'), to: '/artbook' },
				{ label: t('dealer'), to: '/dealer' },
			],
		},
		{
			label: t('schedule'),
			to: '/schedule',
		},
		{
			label: t('about'),
			to: '/about',
		},
	]
}

export { useNavDatas }

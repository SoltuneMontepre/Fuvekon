import { useTranslations } from 'next-intl'
import { useAuthStore } from '@/stores/authStore'

export type NavData = {
	label: string
	to?: string
	children?: NavData[]
}

const useNavDatas = (): NavData[] => {
	const t = useTranslations('nav')
	const account = useAuthStore(state => state.account)

	// Check if user is admin or staff
	const isAdminOrStaff = account?.role && ['admin', 'staff'].includes(account.role.toLowerCase())

	// If user is admin/staff, return empty array to hide all nav items
	if (isAdminOrStaff) {
		return []
	}

	return [
		{
			label: t('ticket'),
			to: '/ticket',
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

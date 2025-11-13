import SideBar from '@/components/nav/SideBar'
import type { ReactNode } from 'react'

type AccountLayoutProps = {
	children: ReactNode
}

const sections = [
	{
		items: [
			{
				label: 'Account',
				href: '/account',
			},
			{
				label: 'ticket',
				href: '/account/ticket',
			},
		],
	},
]

const AccountLayout = ({ children }: AccountLayoutProps) => {
	return (
		<div className='flex'>
			<SideBar sections={sections} />
			<div className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8 lg:py-12'>
				{children}
			</div>
		</div>
	)
}

export default AccountLayout

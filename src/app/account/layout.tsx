'use client'

import SideBar from '@/components/nav/SideBar'
import type { ReactNode } from 'react'
import { UserCircle, Ticket } from 'lucide-react'
import LogoutButton from '@/components/auth/LogoutButton'
import { useGetMe } from '@/hooks/services/auth/useAccount'
import { useAuthStore } from '@/stores/authStore'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type AccountLayoutProps = {
	children: ReactNode
	info: ReactNode
}

const sections = [
	{
		items: [
			{
				label: 'Account',
				href: '/account',
				icon: UserCircle,
			},
			{
				label: 'ticket',
				href: '/account/ticket',
				icon: Ticket,
			},
		],
	},
]

const AccountLayout = ({ children, info }: AccountLayoutProps) => {
	const router = useRouter()
	const { data, isLoading, isError } = useGetMe()
	const setAccount = useAuthStore(state => state.setAccount)

	// Save account data to Zustand store when fetched
	useEffect(() => {
		if (data?.isSuccess && data.data) {
			setAccount(data.data)
		} else if (data && !data.isSuccess) {
			// If API returns but not successful, clear account
			setAccount(null)
		}
	}, [data, setAccount])

	// Redirect to login if there's an error or authentication fails
	useEffect(() => {
		if (!isLoading && (isError || (data && !data.isSuccess))) {
			router.push('/login')
		}
	}, [isError, data, isLoading, router])

	// Show loading state
	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-lg'>Loading...</div>
			</div>
		)
	}

	// Don't render if not authenticated (will redirect)
	if (isError || (data && !data.isSuccess)) {
		return null
	}

	return (
		<div className='flex'>
			<div className='w-[30%]'>
				<SideBar sections={sections} footer={<LogoutButton />} />
			</div>
			<div className='mx-auto flex w-xl max-w-6xl flex-col gap-6 px-4 py-8 md:px-8 lg:py-12'>
				{info}
				{children}
			</div>
		</div>
	)
}

export default AccountLayout

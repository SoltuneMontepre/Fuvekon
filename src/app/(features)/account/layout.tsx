'use client'

import SideBar from '@/components/nav/SideBar'
import type { ReactNode } from 'react'
import { UserCircle, Ticket, Store } from 'lucide-react'
import { useGetMe } from '@/hooks/services/auth/useAccount'
import { useAuthStore } from '@/stores/authStore'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { logger } from '@/utils/logger'
import Loading from '@/components/common/Loading'

type AccountLayoutProps = {
	children: ReactNode
}

const AccountLayout = ({ children }: AccountLayoutProps) => {
	const router = useRouter()
	const t = useTranslations('nav')
	const { data, isLoading, isError } = useGetMe()
	const setAccount = useAuthStore(state => state.setAccount)
	const account = useAuthStore(state => state.account)

	const sections = [
		{
			items: [
				{
					label: t('account'),
					href: '/account',
					icon: UserCircle,
				},
				{
					label: t('myTicket'),
					href: '/account/ticket',
					icon: Ticket,
				},
				// Show dealer booth if user is a dealer; show register only when user has a ticket
				...(account?.is_dealer || data?.data?.is_dealer
					? [
							{
								label: t('myDealerBooth'),
								href: '/account/dealer',
								icon: Store,
							},
					  ]
					: account?.is_has_ticket || data?.data?.is_has_ticket
					? [
							{
								label: t('registerDealer'),
								href: '/account/dealer/register',
								icon: Store,
							},
					  ]
					: []),
			],
		},
	]

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
	// Only redirect when we have definitive failure (not when data is undefined/loading)
	useEffect(() => {
		if (!isLoading && (isError || (data !== undefined && !data.isSuccess))) {
			router.push('/login')
		}
	}, [isError, data, isLoading, router])

	// Show loading state
	if (isLoading) {
		logger.debug('Account layout: Loading user data')
		return <Loading />
	}

	// Don't render if not authenticated (will redirect)
	if (isError || (data && !data.isSuccess)) {
		logger.warn('Account layout: Authentication failed, redirecting to login')
		return null
	}

	return (
		<div
			id='account-layout'
			className='account-layout relative flex min-h-screen w-full '
		>
			{/* Background Image - Behind everything */}
			<div
				id='account-background'
				className='account-background fixed inset-0 z-0'
				style={{
					backgroundImage: `url('/assets/bg-base.webp')`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
				}}
			/>

			{/* Dark overlay for better contrast */}
			<div className='fixed inset-0 z-[1] bg-black/40' />

			{/* Sidebar - Compact with card style */}
			<div
				id='account-sidebar-container'
				className='account-sidebar-container relative z-10 w-[200px] ml-20 mx-6'
			>
				<SideBar sections={sections} />
			</div>

			{/* Main Content - Card-based layout with dark background visible */}
			<div
				id='account-content'
				className='account-content relative z-10 flex-1 flex flex-col gap-6 p-8 mr-6'
			>
				<div className=' dark:bg-dark-surface/95 backdrop-blur-md rounded-2xl shadow-2xl'>
					<section id='account-main-section' className='account-main-section'>
						{children}
					</section>
				</div>
			</div>
		</div>
	)
}

export default AccountLayout

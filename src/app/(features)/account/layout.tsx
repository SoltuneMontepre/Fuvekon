'use client'

import SideBar from '@/components/nav/SideBar'
import type { ReactNode } from 'react'
import { UserCircle, Ticket, Store, Lock } from 'lucide-react'
import { FolderUp } from 'lucide-react'
import { useGetMe } from '@/hooks/services/auth/useAccount'
import { useAuthStore } from '@/stores/authStore'
import { useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { logger } from '@/utils/logger'
import Loading from '@/components/common/Loading'
import Image from 'next/image'
import Background from '@/components/ui/Background'

/** Paths unverified users are allowed to access (profile + change password only). */
const ALLOWED_PATHS_FOR_UNVERIFIED = ['/account', '/account/change-password']

function isAllowedForUnverified(pathname: string): boolean {
	return ALLOWED_PATHS_FOR_UNVERIFIED.includes(pathname)
}

type AccountLayoutProps = {
	children: ReactNode
}

const AccountLayout = ({ children }: AccountLayoutProps) => {
	const router = useRouter()
	const pathname = usePathname()
	const t = useTranslations('nav')
	const { data, isLoading, isError } = useGetMe()
	const setAccount = useAuthStore(state => state.setAccount)
	const account = useAuthStore(state => state.account)

	const isVerified = account?.is_verified ?? data?.data?.is_verified ?? true

	const sections = useMemo(() => {
		const baseItems = [
			{
				label: t('account'),
				href: '/account',
				icon: UserCircle,
			},
			// Only show ticket, conbook, dealer when verified (unverified cannot use these APIs)
			...(isVerified
				? [
						{ label: t('myTicket'), href: '/account/ticket', icon: Ticket },
						{ label: t('myConbook'), href: '/account/conbook', icon: FolderUp },
					]
				: []),
			{
				label: t('changePassword'),
				href: '/account/change-password',
				icon: Lock,
			},
			...(isVerified &&
			(account?.is_dealer || data?.data?.is_dealer)
				? [
						{
							label: t('myDealerBooth'),
							href: '/account/dealer',
							icon: Store,
						},
					]
				: isVerified &&
						(account?.is_has_ticket || data?.data?.is_has_ticket)
					? [
							{
								label: t('registerDealer'),
								href: '/account/dealer/register',
								icon: Store,
							},
						]
					: []),
		]
		return [{ items: baseItems }]
	}, [t, isVerified, account?.is_dealer, account?.is_has_ticket, data?.data?.is_dealer, data?.data?.is_has_ticket])

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

	// Unverified users: only allow /account and /account/change-password; redirect rest to /account
	useEffect(() => {
		if (isLoading || !data?.isSuccess || !data?.data) return
		const verified = data.data.is_verified
		if (verified) return
		if (!isAllowedForUnverified(pathname ?? '')) {
			router.replace('/account')
		}
	}, [data, isLoading, pathname, router])

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
		<div id='account-layout' className='account-layout relative flex w-full'>
			{/* Background Image - Behind everything */}

			<Background />
			{/* Dark overlay for better contrast */}
			<div className='fixed inset-0 z-[1] bg-black/40' />

			{/* Sidebar - Hidden on mobile, visible on md+ */}
			<div
				id='account-sidebar-container'
				className='account-sidebar-container relative z-10 w-[250px] ml-20 hidden md:block'
			>
				<SideBar sections={sections} />
			</div>

			{/* Main Content - Card-based layout with dark background visible */}
			<div id='account-content' className='relative z-10 gap-6 p-8 w-full '>
				<div className='bg-main backdrop-blur-md rounded-2xl shadow-2xl max-w-3xl mx-auto overflow-hidden '>
					<section id='account-main-section' className='relative z-10'>
						{children}
					</section>
					<Image
						src='/assets/common/drum_pattern.webp'
						alt='Drum Pattern'
						width={2000}
						height={2000}
						className='absolute top-0 z-0 opacity-[3%] size-500 object-cover'
						draggable={false}
					/>
				</div>
			</div>
		</div>
	)
}

export default AccountLayout

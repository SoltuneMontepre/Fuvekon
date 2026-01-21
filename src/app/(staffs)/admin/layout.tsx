'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SideBar from '@/components/nav/SideBar'
import { UserCircle, Ticket } from 'lucide-react'
import { useGetMe } from '@/hooks/services/auth/useAccount'
import { useAuthStore } from '@/stores/authStore'
import { logger } from '@/utils/logger'
import Loading from '@/components/common/Loading'

type AdminLayoutProps = {
	revenue: React.ReactElement
	timeline: React.ReactElement
	children: React.ReactElement
}

const sections = [
	{
		items: [
			{
				label: 'Thông số',
				href: '/admin',
				icon: UserCircle,
			},
			{
				label: 'Dashboard',
				href: '/admin/dashboard',
				icon: UserCircle,
			},
			{
				label: 'Quản lý vé',
				href: '/admin/tickets',
				icon: Ticket,
			},
			{
				label: 'Quét vé',
				href: '/admin/scan-ticket',
				icon: Ticket,
			},
			{
				label: 'Art submit',
				href: '/admin/art-submit',
				icon: Ticket,
			},
		],
	},
]

const AdminLayout = ({ children }: AdminLayoutProps) => {
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
	// Only redirect when we have definitive failure (not when data is undefined/loading)
	useEffect(() => {
		if (!isLoading && (isError || (data !== undefined && !data.isSuccess))) {
			router.push('/login')
		}
		// Check if user is authenticated but doesn't have admin/staff role
		if (
			!isLoading &&
			data?.isSuccess &&
			data.data &&
			data.data.role?.toLowerCase() !== 'admin' &&
			data.data.role?.toLowerCase() !== 'staff'
		) {
			router.push('/login')
		}
	}, [isError, data, isLoading, router])

	// Show loading state
	if (isLoading) {
		logger.debug('Admin layout: Loading user data')
		return <Loading />
	}

	// Don't render if not authenticated (will redirect)
	if (isError || (data && !data.isSuccess)) {
		logger.warn('Admin layout: Authentication failed, redirecting to login')
		return null
	}

	// Only render if user is authenticated and has admin/staff role
	const isAuthorized =
		data?.isSuccess &&
		data.data &&
		(data.data.role?.toLowerCase() === 'admin' ||
			data.data.role?.toLowerCase() === 'staff')

	if (!isAuthorized) {
		logger.warn('Admin layout: User not authorized (not admin/staff)', {
			role: data?.data?.role,
		})
		return null
	}

	return (
		<div
			id='admin-layout'
			className='admin-layout relative flex min-h-screen w-full'
		>
			{/* Background Image - Behind everything */}
			<div
				id='admin-background'
				className='admin-background fixed inset-0 z-0'
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
				id='admin-sidebar-container'
				className='admin-sidebar-container relative z-10 w-[200px] ml-20 my-6'
			>
				<SideBar sections={sections} />
				
			</div>

			{/* Main Content - Card-based layout with dark background visible */}
			<div
				id='admin-content'
				className='admin-content relative z-10 flex-1 flex flex-col gap-6 px-8 py-8 mr-6'
			>
				<div className='bg-main/95 dark:bg-dark-surface/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-300/20 dark:border-dark-border/20'>
					
					<section id='admin-main-section' className='admin-main-section'>
						{children}
					</section>
				</div>
			</div>
		</div>
	)
}

export default AdminLayout

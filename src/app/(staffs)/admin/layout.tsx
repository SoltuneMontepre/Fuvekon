'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SideBar from '@/components/nav/SideBar'
import { UserCircle, Ticket } from 'lucide-react'
import { useGetMe } from '@/hooks/services/auth/useAccount'
import { useAuthStore } from '@/stores/authStore'
import LogoutButton from '@/components/auth/login/LogoutButton'

type AdminLayoutProps = {
	revenue: React.JSX.Element
	timeline: React.JSX.Element
	children: React.JSX.Element
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

const AdminLayout = ({ revenue, timeline, children }: AdminLayoutProps) => {
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

	// Only render if user is authenticated and has admin/staff role
	const isAuthorized =
		data?.isSuccess &&
		data.data &&
		(data.data.role?.toLowerCase() === 'admin' ||
			data.data.role?.toLowerCase() === 'staff')

	if (!isAuthorized) {
		return null
	}

	return (
		<div className='flex'>
			<div className='w-[30%]'>
				<SideBar sections={sections} footer={<LogoutButton />} />
			</div>
			<div className='mx-auto flex w-xl max-w-6xl flex-col gap-6 px-4 py-8 md:px-8 lg:py-12'>
				<section>{revenue}</section>
				<section>{timeline}</section>
				<section>{children}</section>
			</div>
		</div>
	)
}

export default AdminLayout

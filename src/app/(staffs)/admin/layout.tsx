'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import SideBar from '@/components/nav/SideBar'
import FuveIconSVG from '@/components/common/FuveIconSVG'
import {
	UserCircle,
	Ticket,
	Store,
	LayoutDashboard,
	Menu,
	X,
} from 'lucide-react'
import { useGetMe } from '@/hooks/services/auth/useAccount'
import { useAuthStore } from '@/stores/authStore'
import { logger } from '@/utils/logger'
import Loading from '@/components/common/Loading'
import Background from '@/components/ui/Background'

const STAFF_SCAN_PATH = '/admin/scan-ticket'

type AdminLayoutProps = {
	revenue: React.ReactElement
	timeline: React.ReactElement
	children: React.ReactElement
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
	const router = useRouter()
	const pathname = usePathname()
	const [mobileNavOpen, setMobileNavOpen] = useState(false)
	const { data, isLoading, isError } = useGetMe()
	const setAccount = useAuthStore(state => state.setAccount)

	const isAdmin = data?.isSuccess && data.data?.role?.toLowerCase() === 'admin'
	const isStaff = data?.isSuccess && data.data?.role?.toLowerCase() === 'staff'

	// Staff only: redirect to QR scan page if on any other admin route
	useEffect(() => {
		if (!isLoading && isStaff && pathname && pathname !== STAFF_SCAN_PATH) {
			router.replace(STAFF_SCAN_PATH)
		}
	}, [isLoading, isStaff, pathname, router])

	useEffect(() => {
		setMobileNavOpen(false)
	}, [pathname])

	useEffect(() => {
		if (!mobileNavOpen) return
		document.body.style.overflow = 'hidden'
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setMobileNavOpen(false)
		}
		window.addEventListener('keydown', onKey)
		return () => {
			document.body.style.overflow = ''
			window.removeEventListener('keydown', onKey)
		}
	}, [mobileNavOpen])

	const sections = isStaff
		? [
				{
					items: [
						{
							label: 'Quét vé',
							href: STAFF_SCAN_PATH,
							icon: Ticket,
						},
					],
				},
			]
		: [
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
							icon: LayoutDashboard,
						},
						...(isAdmin
							? [
									{
										label: 'Quản lý vé',
										href: '/admin/tickets',
										icon: Ticket,
									},
								]
							: []),
						{
							label: 'Quét vé',
							href: STAFF_SCAN_PATH,
							icon: Ticket,
						},
						{
							label: 'Duyệt Conbook',
							href: '/admin/art-submit',
							icon: Ticket,
						},
						{
							label: 'Quản lý Dealer',
							href: '/admin/dealers',
							icon: Store,
						},
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

	// Staff must only see scan-ticket: don't render any other page (avoids 403 from admin-only APIs)
	if (isStaff && pathname !== STAFF_SCAN_PATH) {
		return <Loading />
	}

	const navHrefs = sections
		.flatMap(s => s.items)
		.map(i => i.href)
		.filter((h): h is string => Boolean(h))
	const activeNavHref =
		pathname &&
		[...navHrefs]
			.sort((a, b) => b.length - a.length)
			.find(href => pathname === href || pathname.startsWith(href + '/'))

	const navItemActive = (href: string) =>
		Boolean(activeNavHref && activeNavHref === href)

	return (
		<div
			id='admin-layout'
			className='admin-layout relative flex min-h-[100dvh] w-full'
		>
			{/* Background with wolf mascot */}
			<Background />

			{/* Dark overlay for better contrast */}
			<div className='fixed inset-0 z-[1] bg-black/40' />

			{/* Sidebar - Hidden on mobile, visible on md+ */}
			<div
				id='admin-sidebar-container'
				className='admin-sidebar-container relative z-10 w-[200px] ml-20 my-6 hidden md:block'
			>
				<SideBar sections={sections} />
			</div>

			{/* Main Content - Card-based layout */}
			<div
				id='admin-content'
				className='admin-content relative z-10 flex min-w-0 flex-1 flex-col gap-3 px-3 pb-6 pt-3 sm:gap-6 sm:px-6 sm:py-8 sm:mr-6 md:px-8'
			>
				{/* Mobile: menu + title (sidebar is hidden below md) */}
				<div className='flex shrink-0 items-center gap-3 md:hidden'>
					<button
						type='button'
						onClick={() => setMobileNavOpen(true)}
						className='inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#8C8C8C]/25 bg-main/90 text-[#48715B] shadow-sm backdrop-blur-sm transition-colors hover:bg-[#E2EEE2]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#48715B]/40'
						aria-expanded={mobileNavOpen}
						aria-controls='admin-mobile-nav'
						aria-label='Mở menu điều hướng'
					>
						<Menu className='h-6 w-6' aria-hidden />
					</button>
					<div className='min-w-0 flex-1 rounded-xl border border-[#8C8C8C]/20 bg-main/90 px-3 py-2.5 shadow-sm backdrop-blur-sm'>
						<p className='josefin truncate text-sm font-semibold text-text-primary'>
							Fuvekon Admin
						</p>
						<p className='truncate text-xs text-text-secondary'>Điều hướng nhanh</p>
					</div>
				</div>

				{mobileNavOpen && (
					<>
						<button
							type='button'
							className='fixed inset-0 z-[90] bg-black/50 md:hidden'
							aria-label='Đóng menu'
							onClick={() => setMobileNavOpen(false)}
						/>
						<nav
							id='admin-mobile-nav'
							className='fixed inset-y-0 left-0 z-[100] flex w-[min(288px,88vw)] flex-col border-r border-[#154c5b]/80 bg-bg shadow-2xl md:hidden'
							style={{
								backgroundImage: 'url(/images/sidebar/sidebarBG.png)',
								backgroundSize: 'cover',
								backgroundPosition: 'center',
								backgroundRepeat: 'no-repeat',
								paddingTop: 'env(safe-area-inset-top)',
							}}
							aria-label='Admin navigation'
						>
							<div className='flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3'>
								<Link
									href='/'
									onClick={() => setMobileNavOpen(false)}
									className='flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#48715B]/50'
								>
									<FuveIconSVG />
								</Link>
								<button
									type='button'
									onClick={() => setMobileNavOpen(false)}
									className='inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#E2EEE2] transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40'
									aria-label='Đóng menu'
								>
									<X className='h-6 w-6' aria-hidden />
								</button>
							</div>
							<div className='min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4'>
								<ul className='space-y-1'>
									{sections.map((section, si) =>
										section.items.map((item, ii) => {
											if (!item.href) return null
											const Icon = item.icon
											const active = navItemActive(item.href)
											return (
												<li key={`${si}-${ii}-${item.href}`}>
													<Link
														href={item.href}
														onClick={() => setMobileNavOpen(false)}
														className={`flex min-h-[48px] items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#48715B]/50 ${
															active
																? 'bg-[#48715B]/90 text-[#E2EEE2]'
																: 'bg-bg/80 text-text-secondary hover:bg-[#48715B]/40 hover:text-[#E2EEE2]'
														}`}
														aria-current={active ? 'page' : undefined}
													>
														{Icon && (
															<Icon className='h-5 w-5 shrink-0' aria-hidden />
														)}
														<span className='truncate'>{item.label}</span>
													</Link>
												</li>
											)
										})
									)}
								</ul>
							</div>
						</nav>
					</>
				)}

				<div className='relative min-h-0 flex-1 overflow-hidden rounded-xl bg-main/95 shadow-2xl backdrop-blur-md md:rounded-2xl md:bg-main md:backdrop-blur-md'>
					<Image
						src='/assets/common/drum_pattern.webp'
						alt=''
						width={2000}
						height={2000}
						className='pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-[2%]'
						draggable={false}
					/>
					<section
						id='admin-main-section'
						className='admin-main-section relative z-10 p-4 sm:p-6 md:p-8'
					>
						{children}
					</section>
				</div>
			</div>
		</div>
	)
}

export default AdminLayout

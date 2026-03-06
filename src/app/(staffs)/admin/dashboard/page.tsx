'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import {
	LayoutDashboard,
	Ticket,
	Users,
	Store,
	ScanLine,
	AlertCircle,
	CheckCircle,
	Clock,
	XCircle,
	RefreshCw,
	ArrowRight,
	Banknote,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
	useGetTicketStatistics,
	useGetTicketSalesTimeline,
	useGetTicketRevenue,
} from '@/hooks/services/ticket/useAdminTicket'
import { useAdminGetUsers } from '@/hooks/services/user/useAdminUser'
import { useAdminGetDealers } from '@/hooks/services/dealer/useAdminDealer'
import Loading from '@/components/common/Loading'
import type { TicketStatistics as TicketStatsType } from '@/types/models/ticket/ticket'

const DashboardCharts = dynamic(
	() => import('@/components/admin/DashboardCharts'),
	{ ssr: false }
)

// Stat card with optional icon and link
interface StatCardProps {
	label: string
	value: number | string
	subLabel?: string
	icon?: React.ElementType
	href?: string
	variant?: 'default' | 'warning' | 'success' | 'muted'
}

const StatCard: React.FC<StatCardProps> = ({
	label,
	value,
	subLabel,
	icon: Icon,
	href,
	variant = 'default',
}) => {
	const router = useRouter()
	const variantStyles = {
		default:
			'border-slate-300/20 dark:border-dark-border/20 bg-white/80 dark:bg-dark-surface/80 text-[#154c5b] dark:text-dark-text',
		warning:
			'border-amber-400/30 dark:border-amber-500/20 bg-amber-50/80 dark:bg-amber-900/10 text-amber-800 dark:text-amber-200',
		success:
			'border-emerald-400/30 dark:border-emerald-500/20 bg-emerald-50/80 dark:bg-emerald-900/10 text-emerald-800 dark:text-emerald-200',
		muted:
			'border-slate-300/20 dark:border-dark-border/20 bg-slate-50/80 dark:bg-dark-surface/60 text-slate-600 dark:text-dark-text-secondary',
	}
	const style = variantStyles[variant]
	const isClickable = !!href

	return (
		<div
			role={isClickable ? 'button' : undefined}
			tabIndex={isClickable ? 0 : undefined}
			onClick={isClickable ? () => router.push(href!) : undefined}
			onKeyDown={
				isClickable
					? e => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault()
								router.push(href!)
							}
						}
					: undefined
			}
			className={`rounded-xl border p-5 shadow-sm transition-all ${style} ${
				isClickable
					? 'cursor-pointer hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#7cbc97] focus:ring-offset-2 dark:focus:ring-offset-dark-surface'
					: ''
			}`}
		>
			<div className='flex items-start justify-between'>
				<div>
					<p className='text-sm font-medium text-gray-500 dark:text-dark-text-secondary'>
						{label}
					</p>
					<p className='mt-1 text-2xl font-bold tabular-nums'>{value}</p>
					{subLabel && (
						<p className='mt-0.5 text-xs text-gray-500 dark:text-dark-text-secondary'>
							{subLabel}
						</p>
					)}
				</div>
				{Icon && (
					<div
						className={`rounded-lg p-2 ${
							variant === 'warning'
								? 'bg-amber-100/80 dark:bg-amber-800/30'
								: variant === 'success'
									? 'bg-emerald-100/80 dark:bg-emerald-800/30'
									: 'bg-slate-100 dark:bg-dark-surface'
						}`}
					>
						<Icon className='h-5 w-5' />
					</div>
				)}
			</div>
			{href && (
				<div className='mt-3 flex items-center gap-1 text-sm font-medium text-[#7cbc97] dark:text-emerald-400'>
					<span>Xem chi tiết</span>
					<ArrowRight className='h-4 w-4' />
				</div>
			)}
		</div>
	)
}

// Quick action link card
interface QuickLinkProps {
	label: string
	href: string
	icon: React.ElementType
	description?: string
}

const QuickLink: React.FC<QuickLinkProps> = ({
	label,
	href,
	icon: Icon,
	description,
}) => {
	const router = useRouter()
	return (
		<button
			type='button'
			onClick={() => router.push(href)}
			className='flex w-full items-center gap-4 rounded-xl border border-slate-300/20 dark:border-dark-border/20 bg-white/80 dark:bg-dark-surface/80 p-4 text-left shadow-sm transition-all hover:border-[#7cbc97]/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#7cbc97] focus:ring-offset-2 dark:focus:ring-offset-dark-surface'
		>
			<div className='rounded-lg bg-slate-100 p-3 dark:bg-dark-surface'>
				<Icon className='h-6 w-6 text-[#154c5b] dark:text-dark-text' />
			</div>
			<div className='min-w-0 flex-1'>
				<p className='font-semibold text-[#154c5b] dark:text-dark-text'>
					{label}
				</p>
				{description && (
					<p className='text-sm text-gray-500 dark:text-dark-text-secondary'>
						{description}
					</p>
				)}
			</div>
			<ArrowRight className='h-5 w-5 shrink-0 text-gray-400' />
		</button>
	)
}

function formatRevenue(value: number): string {
	return new Intl.NumberFormat('vi-VN', {
		style: 'currency',
		currency: 'VND',
		maximumFractionDigits: 0,
	}).format(value)
}

const AdminDashboardPage: React.FC = () => {
	const [timelineDays, setTimelineDays] = React.useState(90)
	const [revenueDays, setRevenueDays] = React.useState(90)
	const {
		data: statsData,
		isLoading: statsLoading,
		refetch: refetchStats,
	} = useGetTicketStatistics()
	const { data: timelineData, isLoading: timelineLoading } =
		useGetTicketSalesTimeline(timelineDays)
	const { data: revenueData, isLoading: revenueLoading } =
		useGetTicketRevenue(revenueDays)
	const { data: usersData } = useAdminGetUsers({ page: 1, pageSize: 1 })
	const { data: dealersData } = useAdminGetDealers({ page: 1, page_size: 1 })

	const stats: TicketStatsType | undefined = statsData?.data
	const timelineItems = timelineData?.data ?? []
	const totalRevenue = revenueData?.data?.total_revenue ?? 0
	const revenueByDay = revenueData?.data?.by_day ?? []
	const totalUsers = usersData?.meta?.totalItems ?? 0
	const totalDealers = dealersData?.meta?.totalItems ?? 0

	if (statsLoading) {
		return <Loading />
	}

	return (
		<div id='admin-dashboard-page' className='admin-dashboard-page w-full'>
			{/* Header */}
			<div className='mb-8 flex flex-wrap items-center justify-between gap-4'>
				<div>
					<h1 className='flex items-center gap-2 text-2xl font-bold text-[#154c5b] dark:text-dark-text'>
						<LayoutDashboard className='h-7 w-7' />
						Dashboard
					</h1>
					<p className='mt-1 text-[#48715b] dark:text-dark-text-secondary'>
						Tổng quan và thao tác nhanh
					</p>
				</div>
				<button
					type='button'
					onClick={() => refetchStats()}
					className='flex items-center gap-2 rounded-lg border border-slate-300/20 dark:border-dark-border/20 bg-white/80 dark:bg-dark-surface/80 px-4 py-2 text-sm font-medium text-[#154c5b] dark:text-dark-text shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-dark-surface'
					aria-label='Làm mới'
				>
					<RefreshCw className='h-4 w-4' />
					Làm mới
				</button>
			</div>

			{/* Overview stats */}
			<section className='mb-8'>
				<h2 className='mb-4 text-lg font-semibold text-[#154c5b] dark:text-dark-text'>
					Thống kê tổng quan
				</h2>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					<StatCard
						label='Tổng vé'
						value={stats?.total_tickets ?? 0}
						icon={Ticket}
						href='/admin/tickets'
					/>
					<StatCard
						label='Chờ duyệt'
						value={stats?.pending_count ?? 0}
						subLabel={
							(stats?.pending_over_24_hours ?? 0) > 0
								? `${stats?.pending_over_24_hours} vé chờ > 24h`
								: undefined
						}
						icon={Clock}
						href='/admin/tickets?status=pending'
						variant={
							(stats?.pending_over_24_hours ?? 0) > 0 ? 'warning' : 'default'
						}
					/>
					<StatCard
						label='Đã duyệt'
						value={stats?.approved_count ?? 0}
						icon={CheckCircle}
						variant='success'
					/>
					<StatCard
						label='Từ chối'
						value={stats?.denied_count ?? 0}
						icon={XCircle}
						variant='muted'
					/>
				</div>
			</section>

			{/* Secondary stats row */}
			<section className='mb-8'>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
					<StatCard
						label='Người dùng'
						value={totalUsers}
						icon={Users}
						href='/admin'
					/>
					<StatCard
						label='Dealer'
						value={totalDealers}
						icon={Store}
						href='/admin/dealers'
					/>
					<StatCard
						label='Doanh thu'
						value={formatRevenue(totalRevenue)}
						icon={Banknote}
						variant='success'
					/>
				</div>
			</section>

			{/* Pending over 24h alert */}
			{(stats?.pending_over_24_hours ?? 0) > 0 && (
				<section className='mb-8'>
					<div
						className='flex items-center gap-3 rounded-xl border border-amber-400/40 bg-amber-50/90 p-4 dark:border-amber-500/30 dark:bg-amber-900/20'
						role='alert'
					>
						<AlertCircle className='h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400' />
						<div className='min-w-0 flex-1'>
							<p className='font-medium text-amber-800 dark:text-amber-200'>
								{stats?.pending_over_24_hours} vé đang chờ duyệt quá 24 giờ
							</p>
							<p className='text-sm text-amber-700 dark:text-amber-300'>
								Xem và xử lý tại Quản lý vé.
							</p>
						</div>
						<button
							type='button'
							onClick={() =>
								window.location.assign('/admin/tickets?status=pending')
							}
							className='shrink-0 rounded-lg bg-amber-200/80 px-4 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-300/80 dark:bg-amber-700/50 dark:text-amber-100 dark:hover:bg-amber-600/50'
						>
							Xem ngay
						</button>
					</div>
				</section>
			)}

			<DashboardCharts
				timelineItems={timelineItems}
				timelineLoading={timelineLoading}
				timelineDays={timelineDays}
				setTimelineDays={setTimelineDays}
				revenueByDay={revenueByDay}
				revenueLoading={revenueLoading}
				revenueDays={revenueDays}
				setRevenueDays={setRevenueDays}
				formatRevenue={formatRevenue}
			/>

			{/* Tier breakdown (if available) */}
			{stats?.tier_stats && stats.tier_stats.length > 0 && (
				<section className='mb-8'>
					<h2 className='mb-4 text-lg font-semibold text-[#154c5b] dark:text-dark-text'>
						Thống kê theo loại vé
					</h2>
					<div className='overflow-hidden rounded-xl border border-slate-300/20 dark:border-dark-border/20 bg-white/80 dark:bg-dark-surface/80 shadow-sm'>
						<table className='w-full'>
							<thead>
								<tr className='border-b border-slate-300/20 dark:border-dark-border/20 bg-slate-50/80 dark:bg-dark-surface/50'>
									<th className='px-4 py-3 text-left text-sm font-semibold text-[#154c5b] dark:text-dark-text'>
										Loại vé
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-[#154c5b] dark:text-dark-text'>
										Đã bán
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-[#154c5b] dark:text-dark-text'>
										Tồn kho
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-[#154c5b] dark:text-dark-text'>
										Tổng
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-slate-300/20 dark:divide-dark-border/20'>
								{stats.tier_stats.map(tier => (
									<tr
										key={tier.tier_id}
										className='transition-colors hover:bg-slate-50/50 dark:hover:bg-dark-surface/50'
									>
										<td className='px-4 py-3 font-medium text-[#154c5b] dark:text-dark-text'>
											{tier.tier_name}
										</td>
										<td className='px-4 py-3 text-right tabular-nums text-gray-700 dark:text-dark-text'>
											{tier.sold}
										</td>
										<td className='px-4 py-3 text-right tabular-nums text-gray-700 dark:text-dark-text'>
											{tier.available}
										</td>
										<td className='px-4 py-3 text-right tabular-nums text-gray-600 dark:text-dark-text-secondary'>
											{tier.total_stock}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
			)}

			{/* Quick actions */}
			<section>
				<h2 className='mb-4 text-lg font-semibold text-[#154c5b] dark:text-dark-text'>
					Thao tác nhanh
				</h2>
				<div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
					<QuickLink
						label='Quản lý vé'
						href='/admin/tickets'
						icon={Ticket}
						description='Duyệt, tạo và quản lý vé'
					/>
					<QuickLink
						label='Thông số người dùng'
						href='/admin'
						icon={Users}
						description='Xem và quản lý tài khoản'
					/>
					<QuickLink
						label='Quét vé'
						href='/admin/scan-ticket'
						icon={ScanLine}
						description='Check-in tại cửa'
					/>
					<QuickLink
						label='Quản lý Dealer'
						href='/admin/dealers'
						icon={Store}
						description='Duyệt và quản lý gian hàng'
					/>
				</div>
			</section>
		</div>
	)
}

export default AdminDashboardPage

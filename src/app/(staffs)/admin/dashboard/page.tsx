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
import { useDashboardAnalytics } from '@/hooks/services/analytics/useDashboardAnalytics'
import Loading from '@/components/common/Loading'
import type { TicketStatistics as TicketStatsType } from '@/types/models/ticket/ticket'

const DashboardCharts = dynamic(
	() => import('@/components/admin/DashboardCharts'),
	{ ssr: false }
)

// Stat card
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
		default: 'bg-[#E2EEE2]/60 border-[#8C8C8C]/15 text-text-primary',
		warning: 'bg-amber-50/80 border-amber-200 text-amber-800',
		success: 'bg-emerald-50/80 border-emerald-200 text-emerald-800',
		muted: 'bg-[#E2EEE2]/30 border-[#8C8C8C]/15 text-text-secondary',
	}
	const iconBg = {
		default: 'bg-[#E2EEE2]',
		warning: 'bg-amber-100',
		success: 'bg-emerald-100',
		muted: 'bg-[#E2EEE2]/60',
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
			className={`rounded-xl border p-5 transition-all ${style} ${
				isClickable
					? 'cursor-pointer hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#48715B]'
					: ''
			}`}
		>
			<div className='flex items-start justify-between'>
				<div>
					<p className='text-sm font-medium text-[#48715B]'>{label}</p>
					<p className='mt-1 text-2xl font-bold tabular-nums'>{value}</p>
					{subLabel && (
						<p className='mt-0.5 text-xs text-[#8C8C8C]'>{subLabel}</p>
					)}
				</div>
				{Icon && (
					<div className={`rounded-xl p-2 ${iconBg[variant]}`}>
						<Icon className='h-5 w-5' />
					</div>
				)}
			</div>
			{href && (
				<div className='mt-3 flex items-center gap-1 text-sm font-medium text-[#48715B]'>
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
			className='flex w-full items-center gap-4 rounded-xl border border-[#8C8C8C]/15 bg-[#E2EEE2]/60 p-4 text-left transition-all hover:border-[#48715B]/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#48715B]'
		>
			<div className='rounded-xl bg-[#E2EEE2] p-3'>
				<Icon className='h-6 w-6 text-[#48715B]' />
			</div>
			<div className='min-w-0 flex-1'>
				<p className='font-semibold text-text-primary'>{label}</p>
				{description && (
					<p className='text-sm text-text-secondary'>{description}</p>
				)}
			</div>
			<ArrowRight className='h-5 w-5 shrink-0 text-[#8C8C8C]' />
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
		data: analyticsData,
		isLoading: analyticsLoading,
		refetch: refetchDashboard,
	} = useDashboardAnalytics({ timelineDays, revenueDays })

	const d = analyticsData?.data
	const stats: TicketStatsType | undefined = d?.ticket_stats
	const timelineItems = d?.sales_timeline ?? []
	const totalRevenue = d?.revenue?.total_revenue ?? 0
	const revenueByDay = d?.revenue?.by_day ?? []
	const totalUsers = d?.user_count ?? 0
	const totalDealers = d?.dealer_count ?? 0

	if (analyticsLoading) {
		return <Loading />
	}

	return (
		<div className='w-full'>
			{/* Header */}
			<div className='flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#48715B]/15'>
				<div>
					<h1 className='flex items-center gap-2 text-2xl font-bold text-text-primary josefin'>
						<LayoutDashboard className='h-7 w-7' />
						Dashboard
					</h1>
					<p className='mt-1 text-text-secondary'>
						Tổng quan và thao tác nhanh
					</p>
				</div>
				<button
					type='button'
					onClick={() => refetchDashboard()}
					className='flex items-center gap-2 rounded-xl border border-[#8C8C8C]/15 bg-[#E2EEE2]/60 px-4 py-2.5 text-sm font-medium text-[#48715B] transition-colors hover:bg-[#E2EEE2]'
					aria-label='Làm mới'
				>
					<RefreshCw className='h-4 w-4' />
					Làm mới
				</button>
			</div>

			{/* Overview stats */}
			<section className='mt-6 mb-8'>
				<h2 className='mb-4 text-lg font-semibold text-text-primary'>
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
						className='flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 sm:flex-row sm:items-center'
						role='alert'
					>
						<div className='flex items-start gap-3 sm:min-w-0 sm:flex-1'>
							<AlertCircle className='mt-0.5 h-6 w-6 shrink-0 text-amber-600' />
							<div className='min-w-0 flex-1'>
								<p className='font-medium text-amber-800'>
									{stats?.pending_over_24_hours} vé đang chờ duyệt quá 24 giờ
								</p>
								<p className='text-sm text-amber-700'>
									Xem và xử lý tại Quản lý vé.
								</p>
							</div>
						</div>
						<button
							type='button'
							onClick={() =>
								window.location.assign('/admin/tickets?status=pending')
							}
							className='w-full shrink-0 rounded-xl bg-amber-200/80 px-4 py-2.5 text-center text-sm font-medium text-amber-900 transition-colors hover:bg-amber-300/80 sm:w-auto'
						>
							Xem ngay
						</button>
					</div>
				</section>
			)}

			<DashboardCharts
				timelineItems={timelineItems}
				timelineLoading={false}
				timelineDays={timelineDays}
				setTimelineDays={setTimelineDays}
				revenueByDay={revenueByDay}
				revenueLoading={false}
				revenueDays={revenueDays}
				setRevenueDays={setRevenueDays}
				formatRevenue={formatRevenue}
			/>

			{/* Tier breakdown */}
			{stats?.tier_stats && stats.tier_stats.length > 0 && (
				<section className='mb-8'>
					<h2 className='mb-4 text-lg font-semibold text-text-primary'>
						Thống kê theo loại vé
					</h2>
					<div className='overflow-x-auto rounded-xl border border-[#8C8C8C]/15'>
						<table className='w-full min-w-[520px]'>
							<thead>
								<tr className='border-b border-[#48715B]/15'>
									<th className='px-4 py-3 text-left text-sm font-semibold text-[#48715B]'>
										Loại vé
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-[#48715B]'>
										Đã bán
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-[#48715B]'>
										Tồn kho
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-[#48715B]'>
										Tổng
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-[#48715B]/10'>
								{stats.tier_stats.map(tier => (
									<tr
										key={tier.tier_id}
										className='transition-colors hover:bg-[#E2EEE2]/40'
									>
										<td className='px-4 py-3 font-medium text-text-primary'>
											{tier.tier_name}
										</td>
										<td className='px-4 py-3 text-right tabular-nums text-text-secondary'>
											{tier.sold}
										</td>
										<td className='px-4 py-3 text-right tabular-nums text-text-secondary'>
											{tier.available}
										</td>
										<td className='px-4 py-3 text-right tabular-nums text-[#8C8C8C]'>
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
				<h2 className='mb-4 text-lg font-semibold text-text-primary'>
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
						label='Dashboard người dùng'
						href='/admin/dashboard/users'
						icon={Users}
						description='Theo quốc gia, nhóm tuổi, thống kê nhanh'
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

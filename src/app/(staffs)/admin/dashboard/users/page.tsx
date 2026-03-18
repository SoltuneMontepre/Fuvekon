'use client'

import React from 'react'
import { Users, Globe2, UserRound } from 'lucide-react'
import { getName } from 'country-list'
import Loading from '@/components/common/Loading'
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts'
import {
	useAdminGetUserCountByCountry,
	useAdminGetUserCountByAgeRange,
} from '@/hooks/services/user/useAdminUser'
import { useDashboardAnalytics } from '@/hooks/services/analytics/useDashboardAnalytics'

export default function AdminDashboardUsersPage(): React.ReactElement {
	const { data: analyticsData, isLoading: analyticsLoading } =
		useDashboardAnalytics()
	const { data: countByCountryData, isLoading: countByCountryLoading } =
		useAdminGetUserCountByCountry()
	const { data: countByAgeRangeData, isLoading: countByAgeRangeLoading } =
		useAdminGetUserCountByAgeRange()

	const totalUsers = analyticsData?.data?.user_count ?? 0
	const byCountry = countByCountryData?.data?.by_country ?? []
	const byAgeRange = countByAgeRangeData?.data?.by_age_range ?? []

	const totalByCountry = byCountry.reduce((sum, row) => sum + row.count, 0)
	const topCountries = byCountry.slice(0, 12)
	const ageBuckets = byAgeRange.filter(b => b.range !== 'unknown' && b.range !== 'other')
	const unknownAge = byAgeRange.find(b => b.range === 'unknown')?.count ?? 0

	if (analyticsLoading) return <Loading />

	return (
		<div className='w-full'>
			<div className='pb-6 border-b border-[#48715B]/15'>
				<h1 className='text-2xl font-bold text-text-primary josefin flex items-center gap-2'>
					<UserRound className='w-6 h-6' />
					User dashboard
				</h1>
				<p className='text-text-secondary mt-1'>
					Tổng quan người dùng (quốc gia, nhóm tuổi)
				</p>
			</div>

			<section className='mt-6 mb-8'>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					<div className='rounded-xl border border-[#8C8C8C]/15 bg-[#E2EEE2]/60 p-5 text-text-primary'>
						<div className='flex items-start justify-between'>
							<div>
								<p className='text-sm font-medium text-[#48715B]'>Người dùng</p>
								<p className='mt-1 text-2xl font-bold tabular-nums'>{totalUsers}</p>
							</div>
							<div className='rounded-xl bg-[#E2EEE2] p-2'>
								<Users className='h-5 w-5 text-[#48715B]' />
							</div>
						</div>
					</div>

					<div className='rounded-xl border border-[#8C8C8C]/15 bg-[#E2EEE2]/60 p-5 text-text-primary'>
						<div className='flex items-start justify-between'>
							<div>
								<p className='text-sm font-medium text-[#48715B]'>Theo quốc gia</p>
								<p className='mt-1 text-2xl font-bold tabular-nums'>{totalByCountry}</p>
								<p className='mt-0.5 text-xs text-[#8C8C8C]'>Tổng tài khoản có thống kê</p>
							</div>
							<div className='rounded-xl bg-[#E2EEE2] p-2'>
								<Globe2 className='h-5 w-5 text-[#48715B]' />
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className='mb-8'>
				<h2 className='mb-4 text-lg font-semibold text-text-primary'>
					Tài khoản theo quốc gia
				</h2>
				<div className='overflow-hidden rounded-xl border border-[#8C8C8C]/15 bg-white/50'>
					{countByCountryLoading ? (
						<div className='py-10 text-center text-text-secondary'>Đang tải…</div>
					) : topCountries.length === 0 ? (
						<div className='py-10 text-center text-text-secondary'>
							Chưa có dữ liệu theo quốc gia.
						</div>
					) : (
						<>
							<div className='border-b border-[#48715B]/15 px-4 py-2 text-sm text-[#48715B]'>
								Top {topCountries.length} • Tổng: {totalByCountry} tài khoản
							</div>
							<table className='w-full'>
								<thead>
									<tr className='border-b border-[#48715B]/15'>
										<th className='px-4 py-3 text-left text-sm font-semibold text-[#48715B]'>
											Quốc gia
										</th>
										<th className='px-4 py-3 text-right text-sm font-semibold text-[#48715B]'>
											Số lượng
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-[#48715B]/10'>
									{topCountries.map(row => (
										<tr
											key={row.country || '__empty__'}
											className='transition-colors hover:bg-[#E2EEE2]/40'
										>
											<td className='px-4 py-3 font-medium text-text-primary'>
												{row.country ? getName(row.country) || row.country : '—'}
											</td>
											<td className='px-4 py-3 text-right tabular-nums text-text-secondary'>
												{row.count}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</>
					)}
				</div>
			</section>

			<section className='mb-8'>
				<div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
					<h2 className='text-lg font-semibold text-text-primary'>Nhóm tuổi</h2>
					{unknownAge > 0 && (
						<span className='text-sm text-text-secondary tabular-nums'>
							Chưa khai DOB: {unknownAge}
						</span>
					)}
				</div>
				<div className='overflow-hidden rounded-xl border border-[#8C8C8C]/15 bg-white/50'>
					{countByAgeRangeLoading ? (
						<div className='py-10 text-center text-text-secondary'>Đang tải…</div>
					) : ageBuckets.length === 0 ? (
						<div className='py-10 text-center text-text-secondary'>
							Chưa có dữ liệu nhóm tuổi.
						</div>
					) : (
						<div className='p-4'>
							<div className='h-64 w-full sm:h-80'>
								<ResponsiveContainer width='100%' height='100%'>
									<BarChart
										data={ageBuckets}
										margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
									>
										<CartesianGrid
											strokeDasharray='3 3'
											stroke='#8C8C8C'
											opacity={0.15}
											vertical={false}
										/>
										<XAxis
											dataKey='range'
											tick={{ fontSize: 11, fill: '#8C8C8C' }}
											tickLine={false}
											axisLine={{ stroke: '#8C8C8C', opacity: 0.2 }}
										/>
										<YAxis
											dataKey='count'
											tick={{ fontSize: 11, fill: '#8C8C8C' }}
											tickLine={false}
											axisLine={false}
											allowDecimals={false}
											width={28}
										/>
										<Tooltip
											contentStyle={{
												backgroundColor: 'rgba(255,255,255,0.95)',
												border: '1px solid rgba(140,140,140,0.15)',
												borderRadius: '12px',
												boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
											}}
											labelStyle={{ color: '#48715B', fontWeight: 600 }}
											formatter={(value: number | undefined) => [
												`${value ?? 0} tài khoản`,
												'Số lượng',
											]}
											labelFormatter={(label: React.ReactNode) => label}
										/>
										<Bar
											dataKey='count'
											fill='#48715B'
											radius={[10, 10, 0, 0]}
											isAnimationActive={true}
											animationDuration={600}
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>
					)}
				</div>
			</section>
		</div>
	)
}


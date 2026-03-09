'use client'

import React from 'react'
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts'
import { RefreshCw } from 'lucide-react'

const TIMELINE_DAYS_OPTIONS = [30, 90, 180] as const

export interface TimelineItem {
	date: string
	count: number
}

export interface RevenueByDayItem {
	date: string
	revenue: number
}

export interface DashboardChartsProps {
	timelineItems: TimelineItem[]
	timelineLoading: boolean
	timelineDays: number
	setTimelineDays: (d: number) => void
	revenueByDay: RevenueByDayItem[]
	revenueLoading: boolean
	revenueDays: number
	setRevenueDays: (d: number) => void
	formatRevenue: (value: number) => string
}

function formatDateLabel(dateStr: string): string {
	try {
		const d = new Date(dateStr + 'T00:00:00')
		return d.toLocaleDateString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		})
	} catch {
		return dateStr
	}
}

export default function DashboardCharts({
	timelineItems,
	timelineLoading,
	timelineDays,
	setTimelineDays,
	revenueByDay,
	revenueLoading,
	revenueDays,
	setRevenueDays,
	formatRevenue,
}: DashboardChartsProps) {
	const timelineData = timelineItems.map(item => ({
		...item,
		dateLabel: formatDateLabel(item.date),
	}))
	const revenueData = revenueByDay.map(item => ({
		...item,
		dateLabel: formatDateLabel(item.date),
	}))

	return (
		<>
			{/* Ticket sell timeline */}
			<section className='mb-8'>
				<div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
					<h2 className='text-lg font-semibold text-text-primary'>
						Timeline bán vé
					</h2>
					<div className='flex gap-2'>
						{TIMELINE_DAYS_OPTIONS.map(d => (
							<button
								key={d}
								type='button'
								onClick={() => setTimelineDays(d)}
								className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
									timelineDays === d
										? 'border-[#48715B] bg-[#48715B]/10 text-[#48715B]'
										: 'border-[#8C8C8C]/15 bg-[#E2EEE2]/60 text-text-secondary hover:bg-[#E2EEE2]'
								}`}
							>
								{d} ngày
							</button>
						))}
					</div>
				</div>
				<div className='overflow-hidden rounded-xl border border-[#8C8C8C]/15'>
					{timelineLoading ? (
						<div className='flex items-center justify-center py-12'>
							<RefreshCw className='h-8 w-8 animate-spin text-[#8C8C8C]' />
						</div>
					) : timelineItems.length === 0 ? (
						<div className='py-12 text-center text-text-secondary'>
							Chưa có dữ liệu bán vé trong khoảng thời gian này.
						</div>
					) : (
						<div className='p-4'>
							<div className='h-64 w-full sm:h-80'>
								<ResponsiveContainer width='100%' height='100%'>
									<AreaChart
										data={timelineData}
										margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
									>
										<defs>
											<linearGradient
												id='timelineFill'
												x1='0'
												y1='0'
												x2='0'
												y2='1'
											>
												<stop
													offset='0%'
													stopColor='#48715B'
													stopOpacity={0.3}
												/>
												<stop
													offset='100%'
													stopColor='#48715B'
													stopOpacity={0}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid
											strokeDasharray='3 3'
											stroke='#8C8C8C'
											opacity={0.15}
											vertical={false}
										/>
										<XAxis
											dataKey='dateLabel'
											tick={{ fontSize: 11, fill: '#8C8C8C' }}
											tickLine={false}
											axisLine={{ stroke: '#8C8C8C', opacity: 0.2 }}
											interval='preserveStartEnd'
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
											formatter={(value: number | undefined) => [`${value ?? 0} vé`, 'Số vé']}
											labelFormatter={(label: React.ReactNode) => label}
										/>
										<Area
											type='monotone'
											dataKey='count'
											stroke='#48715B'
											strokeWidth={2}
											fill='url(#timelineFill)'
											isAnimationActive={true}
											animationDuration={600}
										/>
									</AreaChart>
								</ResponsiveContainer>
							</div>
						</div>
					)}
				</div>
			</section>

			{/* Revenue timeline */}
			<section className='mb-8'>
				<div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
					<h2 className='text-lg font-semibold text-text-primary'>
						Doanh thu theo ngày
					</h2>
					<div className='flex gap-2'>
						{TIMELINE_DAYS_OPTIONS.map(d => (
							<button
								key={d}
								type='button'
								onClick={() => setRevenueDays(d)}
								className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
									revenueDays === d
										? 'border-[#48715B] bg-[#48715B]/10 text-[#48715B]'
										: 'border-[#8C8C8C]/15 bg-[#E2EEE2]/60 text-text-secondary hover:bg-[#E2EEE2]'
								}`}
							>
								{d} ngày
							</button>
						))}
					</div>
				</div>
				<div className='overflow-hidden rounded-xl border border-[#8C8C8C]/15'>
					{revenueLoading ? (
						<div className='flex items-center justify-center py-12'>
							<RefreshCw className='h-8 w-8 animate-spin text-[#8C8C8C]' />
						</div>
					) : revenueByDay.length === 0 ? (
						<div className='py-12 text-center text-text-secondary'>
							Chưa có dữ liệu doanh thu trong khoảng thời gian này.
						</div>
					) : (
						<div className='p-4'>
							<div className='h-64 w-full sm:h-80'>
								<ResponsiveContainer width='100%' height='100%'>
									<AreaChart
										data={revenueData}
										margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
									>
										<defs>
											<linearGradient
												id='revenueFill'
												x1='0'
												y1='0'
												x2='0'
												y2='1'
											>
												<stop
													offset='0%'
													stopColor='#0d9488'
													stopOpacity={0.3}
												/>
												<stop
													offset='100%'
													stopColor='#0d9488'
													stopOpacity={0}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid
											strokeDasharray='3 3'
											stroke='#8C8C8C'
											opacity={0.15}
											vertical={false}
										/>
										<XAxis
											dataKey='dateLabel'
											tick={{ fontSize: 11, fill: '#8C8C8C' }}
											tickLine={false}
											axisLine={{ stroke: '#8C8C8C', opacity: 0.2 }}
											interval='preserveStartEnd'
										/>
										<YAxis
											dataKey='revenue'
											tick={{ fontSize: 11, fill: '#8C8C8C' }}
											tickLine={false}
											axisLine={false}
											allowDecimals={false}
											width={48}
											tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
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
												formatRevenue(value ?? 0),
												'Doanh thu',
											]}
											labelFormatter={(label: React.ReactNode) => label}
										/>
										<Area
											type='monotone'
											dataKey='revenue'
											stroke='#0d9488'
											strokeWidth={2}
											fill='url(#revenueFill)'
											isAnimationActive={true}
											animationDuration={600}
										/>
									</AreaChart>
								</ResponsiveContainer>
							</div>
						</div>
					)}
				</div>
			</section>
		</>
	)
}

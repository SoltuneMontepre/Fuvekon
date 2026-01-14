'use client'

import React, { useState } from 'react'
import {
	CheckCircle,
	XCircle,
	Clock,
	RefreshCw,
	Search,
	Filter,
	AlertTriangle,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
	useAdminGetTickets,
	useGetTicketStatistics,
	useApproveTicket,
	useDenyTicket,
	type AdminTicketFilter,
} from '@/hooks/services/ticket/useAdminTicket'
import { useGetTiers } from '@/hooks/services/ticket/useTicket'
import type { TicketStatus, UserTicket } from '@/types/models/ticket/ticket'

// Format price in VND
const formatPrice = (price: number): string => {
	return new Intl.NumberFormat('vi-VN', {
		style: 'decimal',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

// Status display configuration (icons only, labels come from translations)
const STATUS_ICONS: Record<TicketStatus, { icon: React.ReactNode; bgColor: string; textColor: string }> = {
	pending: {
		icon: <Clock className='w-4 h-4' />,
		bgColor: 'bg-yellow-100',
		textColor: 'text-yellow-700',
	},
	self_confirmed: {
		icon: <RefreshCw className='w-4 h-4' />,
		bgColor: 'bg-blue-100',
		textColor: 'text-blue-700',
	},
	approved: {
		icon: <CheckCircle className='w-4 h-4' />,
		bgColor: 'bg-green-100',
		textColor: 'text-green-700',
	},
	denied: {
		icon: <XCircle className='w-4 h-4' />,
		bgColor: 'bg-red-100',
		textColor: 'text-red-700',
	},
}

const TicketManagementPage = (): React.ReactElement => {
	const t = useTranslations('admin')
	const tTicket = useTranslations('ticket')
	const tCommon = useTranslations('common')

	// Get status label from translations
	const getStatusLabel = (status: TicketStatus): string => {
		const statusLabels: Record<TicketStatus, string> = {
			pending: tTicket('status.pending'),
			self_confirmed: tTicket('status.selfConfirmed'),
			approved: tTicket('status.approved'),
			denied: tTicket('status.denied'),
		}
		return statusLabels[status]
	}

	// Filter state
	const [filter, setFilter] = useState<AdminTicketFilter>({
		page: 1,
		page_size: 20,
	})
	const [searchInput, setSearchInput] = useState('')
	const [showDenyDialog, setShowDenyDialog] = useState(false)
	const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null)
	const [denyReason, setDenyReason] = useState('')

	// Queries
	const { data: ticketsData, isLoading: ticketsLoading, refetch: refetchTickets } = useAdminGetTickets(filter)
	const { data: statsData, isLoading: statsLoading } = useGetTicketStatistics()
	const { data: tiersData } = useGetTiers()

	// Mutations
	const approveMutation = useApproveTicket()
	const denyMutation = useDenyTicket()

	const tickets = ticketsData?.data || []
	const stats = statsData?.data
	const tiers = tiersData?.data || []
	const pagination = (ticketsData as { meta?: { totalPages: number; currentPage: number } })?.meta

	// Handle search
	const handleSearch = () => {
		setFilter(prev => ({
			...prev,
			search: searchInput || undefined,
			page: 1,
		}))
	}

	// Handle filter change
	const handleStatusFilter = (status: TicketStatus | 'all' | 'pending_over_24') => {
		if (status === 'all') {
			setFilter(prev => ({
				...prev,
				status: undefined,
				pending_over_24: undefined,
				page: 1,
			}))
		} else if (status === 'pending_over_24') {
			setFilter(prev => ({
				...prev,
				status: 'self_confirmed',
				pending_over_24: true,
				page: 1,
			}))
		} else {
			setFilter(prev => ({
				...prev,
				status,
				pending_over_24: undefined,
				page: 1,
			}))
		}
	}

	// Handle tier filter
	const handleTierFilter = (tierId: string) => {
		setFilter(prev => ({
			...prev,
			tier_id: tierId || undefined,
			page: 1,
		}))
	}

	// Handle approve
	const handleApprove = async (ticket: UserTicket) => {
		try {
			await approveMutation.mutateAsync(ticket.id)
		} catch {
			// Error handled by mutation
		}
	}

	// Handle deny
	const handleDenyClick = (ticket: UserTicket) => {
		setSelectedTicket(ticket)
		setDenyReason('')
		setShowDenyDialog(true)
	}

	const handleDenyConfirm = async () => {
		if (!selectedTicket) return
		try {
			await denyMutation.mutateAsync({
				ticketId: selectedTicket.id,
				reason: denyReason || undefined,
			})
			setShowDenyDialog(false)
			setSelectedTicket(null)
		} catch {
			// Error handled by mutation
		}
	}

	// Pagination
	const handlePageChange = (page: number) => {
		setFilter(prev => ({ ...prev, page }))
	}

	return (
		<div id='ticket-management-page' className='ticket-management-page w-full'>
			{/* Header */}
			<div id='ticket-management-header' className='ticket-management-header mb-6'>
				<h1 className='text-2xl font-bold text-[#154c5b] dark:text-dark-text'>
					{t('ticketManagement')}
				</h1>
				<p className='text-[#48715b] dark:text-dark-text-secondary'>
					{t('ticketManagementDesc')}
				</p>
			</div>

			{/* Statistics Cards */}
			{!statsLoading && stats && (
				<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6'>
					<div className='bg-white rounded-lg p-4 shadow-sm border'>
						<p className='text-sm text-gray-500'>{t('totalTickets')}</p>
						<p className='text-2xl font-bold text-[#154c5b]'>{stats.total_tickets}</p>
					</div>
					<div className='bg-yellow-50 rounded-lg p-4 shadow-sm border border-yellow-200'>
						<p className='text-sm text-yellow-700'>{t('pendingPayment')}</p>
						<p className='text-2xl font-bold text-yellow-700'>{stats.pending_count}</p>
					</div>
					<div className='bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200'>
						<p className='text-sm text-blue-700'>{t('verifying')}</p>
						<p className='text-2xl font-bold text-blue-700'>{stats.self_confirmed_count}</p>
					</div>
					<div className='bg-green-50 rounded-lg p-4 shadow-sm border border-green-200'>
						<p className='text-sm text-green-700'>{t('confirmed')}</p>
						<p className='text-2xl font-bold text-green-700'>{stats.approved_count}</p>
					</div>
					<div className='bg-red-50 rounded-lg p-4 shadow-sm border border-red-200'>
						<p className='text-sm text-red-700'>{t('denied')}</p>
						<p className='text-2xl font-bold text-red-700'>{stats.denied_count}</p>
					</div>
					<div
						className={`rounded-lg p-4 shadow-sm border cursor-pointer transition-colors ${
							filter.pending_over_24
								? 'bg-orange-200 border-orange-400'
								: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
						}`}
						onClick={() => handleStatusFilter('pending_over_24')}
					>
						<p className='text-sm text-orange-700 flex items-center gap-1'>
							<AlertTriangle className='w-4 h-4' />
							{t('over24Hours')}
						</p>
						<p className='text-2xl font-bold text-orange-700'>{stats.pending_over_24_hours}</p>
					</div>
				</div>
			)}

			{/* Tier Stock Overview */}
			{stats?.tier_stats && stats.tier_stats.length > 0 && (
				<div className='bg-white rounded-lg shadow-sm border p-4 mb-6'>
					<h3 className='font-semibold text-[#154c5b] mb-3'>{t('ticketsByType')}</h3>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						{stats.tier_stats.map(tier => (
							<div key={tier.tier_id} className='border rounded-lg p-3'>
								<div className='flex justify-between items-center mb-2'>
									<span className='font-medium text-[#154c5b]'>{tier.tier_name}</span>
									<span className='text-xs bg-gray-100 px-2 py-1 rounded'>{tier.tier_code}</span>
								</div>
								<div className='w-full bg-gray-200 rounded-full h-2 mb-2'>
									<div
										className='bg-[#7cbc97] h-2 rounded-full transition-all'
										style={{
											width: `${tier.total_stock > 0 ? (tier.sold / tier.total_stock) * 100 : 0}%`,
										}}
									/>
								</div>
								<div className='flex justify-between text-sm text-gray-600'>
									<span>
										{t('sold')}: {tier.sold}
									</span>
									<span>
										{t('available')}: {tier.available}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Filters */}
			<div className='bg-white rounded-lg shadow-sm border p-4 mb-6'>
				<div className='flex flex-wrap gap-4 items-center'>
					{/* Search */}
					<div className='flex-1 min-w-[200px] flex gap-2'>
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
							<input
								type='text'
								placeholder={t('searchPlaceholder')}
								value={searchInput}
								onChange={e => setSearchInput(e.target.value)}
								onKeyDown={e => e.key === 'Enter' && handleSearch()}
								className='w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7cbc97]'
							/>
						</div>
						<button
							onClick={handleSearch}
							className='px-4 py-2 bg-[#7cbc97] text-white rounded-lg hover:bg-[#6aab85]'
						>
							{t('search')}
						</button>
					</div>

					{/* Status Filter */}
					<div className='flex items-center gap-2'>
						<Filter className='w-4 h-4 text-gray-400' />
						<select
							value={filter.pending_over_24 ? 'pending_over_24' : filter.status || 'all'}
							onChange={e =>
								handleStatusFilter(e.target.value as TicketStatus | 'all' | 'pending_over_24')
							}
							className='border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7cbc97]'
						>
							<option value='all'>{t('allStatus')}</option>
							<option value='pending'>{tTicket('status.pending')}</option>
							<option value='self_confirmed'>{tTicket('status.selfConfirmed')}</option>
							<option value='approved'>{tTicket('status.approved')}</option>
							<option value='denied'>{tTicket('status.denied')}</option>
							<option value='pending_over_24'>{t('over24Hours')}</option>
						</select>
					</div>

					{/* Tier Filter */}
					<select
						value={filter.tier_id || ''}
						onChange={e => handleTierFilter(e.target.value)}
						className='border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7cbc97]'
					>
						<option value=''>{t('allTypes')}</option>
						{tiers.map(tier => (
							<option key={tier.id} value={tier.id}>
								{tier.ticket_name}
							</option>
						))}
					</select>

					{/* Refresh Button */}
					<button
						onClick={() => refetchTickets()}
						className='p-2 border rounded-lg hover:bg-gray-50'
						title={t('refresh')}
					>
						<RefreshCw className='w-4 h-4 text-gray-600' />
					</button>
				</div>
			</div>

			{/* Tickets Table */}
			<div className='bg-white rounded-lg shadow-sm border overflow-hidden'>
				{ticketsLoading ? (
					<div className='p-8 text-center text-gray-500'>{tCommon('loading')}</div>
				) : tickets.length === 0 ? (
					<div className='p-8 text-center text-gray-500'>{t('noTickets')}</div>
				) : (
					<>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead className='bg-gray-50 border-b'>
									<tr>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>
											{t('code')}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>
											{t('buyer')}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>
											{t('type')}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>
											{t('status')}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>
											{t('createdAt')}
										</th>
										<th className='px-4 py-3 text-center text-sm font-semibold text-gray-600'>
											{t('actions')}
										</th>
									</tr>
								</thead>
								<tbody className='divide-y'>
									{tickets.map(ticket => {
										const statusConfig = STATUS_ICONS[ticket.status]
										const user = ticket.user
										return (
											<tr key={ticket.id} className='hover:bg-gray-50'>
												<td className='px-4 py-3'>
													<span className='font-mono font-semibold text-[#154c5b]'>
														{ticket.reference_code}
													</span>
												</td>
												<td className='px-4 py-3'>
													<div>
														<p className='font-medium text-gray-900'>
															{user?.first_name} {user?.last_name}
														</p>
														<p className='text-sm text-gray-500'>{user?.email}</p>
														{user?.fursona_name && (
															<p className='text-xs text-[#48715b]'>
																({user.fursona_name})
															</p>
														)}
													</div>
												</td>
												<td className='px-4 py-3'>
													<div>
														<p className='font-medium text-gray-900'>
															{ticket.tier?.ticket_name}
														</p>
														<p className='text-sm text-gray-500'>
															{ticket.tier?.price
																? formatPrice(ticket.tier.price)
																: '–'}{' '}
															VND
														</p>
													</div>
												</td>
												<td className='px-4 py-3'>
													<span
														className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
													>
														{statusConfig.icon}
														{getStatusLabel(ticket.status)}
													</span>
													{ticket.denial_reason && (
														<p className='text-xs text-red-600 mt-1'>
															{tTicket('denialReason')}: {ticket.denial_reason}
														</p>
													)}
												</td>
												<td className='px-4 py-3 text-sm text-gray-600'>
													{new Date(ticket.created_at).toLocaleDateString('vi-VN')}
													<br />
													<span className='text-xs text-gray-400'>
														{new Date(ticket.created_at).toLocaleTimeString('vi-VN')}
													</span>
												</td>
												<td className='px-4 py-3'>
													{ticket.status === 'self_confirmed' && (
														<div className='flex justify-center gap-2'>
															<button
																onClick={() => handleApprove(ticket)}
																disabled={approveMutation.isPending}
																className='px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium disabled:opacity-50'
															>
																{t('approve')}
															</button>
															<button
																onClick={() => handleDenyClick(ticket)}
																disabled={denyMutation.isPending}
																className='px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium disabled:opacity-50'
															>
																{t('deny')}
															</button>
														</div>
													)}
													{ticket.status === 'approved' && (
														<span className='text-sm text-green-600'>
															{ticket.approved_at
																? new Date(ticket.approved_at).toLocaleDateString(
																		'vi-VN'
																	)
																: '–'}
														</span>
													)}
													{ticket.status === 'denied' && (
														<span className='text-sm text-red-600'>
															{ticket.denied_at
																? new Date(ticket.denied_at).toLocaleDateString('vi-VN')
																: '–'}
														</span>
													)}
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>

						{/* Pagination */}
						{pagination && pagination.totalPages > 1 && (
							<div className='px-4 py-3 border-t flex items-center justify-between'>
								<p className='text-sm text-gray-600'>
									{t('page', { current: pagination.currentPage, total: pagination.totalPages })}
								</p>
								<div className='flex gap-2'>
									<button
										onClick={() => handlePageChange(pagination.currentPage - 1)}
										disabled={pagination.currentPage <= 1}
										className='p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
									>
										<ChevronLeft className='w-4 h-4' />
									</button>
									<button
										onClick={() => handlePageChange(pagination.currentPage + 1)}
										disabled={pagination.currentPage >= pagination.totalPages}
										className='p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
									>
										<ChevronRight className='w-4 h-4' />
									</button>
								</div>
							</div>
						)}
					</>
				)}
			</div>

			{/* Deny Dialog */}
			{showDenyDialog && selectedTicket && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
					<div className='bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl'>
						<h3 className='text-xl font-semibold text-[#154c5b] mb-4'>{t('denyTicketTitle')}</h3>
						<p className='text-[#48715b] mb-2'>
							{t('denyingTicket', { code: selectedTicket.reference_code })}
						</p>
						<p className='text-sm text-gray-500 mb-4'>
							{t('user')}: {selectedTicket.user?.first_name} {selectedTicket.user?.last_name} (
							{selectedTicket.user?.email})
						</p>

						{selectedTicket.user && selectedTicket.user.denial_count >= 2 && (
							<div className='bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4'>
								<p className='text-orange-800 text-sm flex items-center gap-2'>
									<AlertTriangle className='w-4 h-4' />
									{t('blacklistWarning', { count: selectedTicket.user.denial_count })}
								</p>
							</div>
						)}

						<div className='mb-4'>
							<label className='block text-sm text-[#48715b] mb-1'>{t('denyReason')}</label>
							<textarea
								value={denyReason}
								onChange={e => setDenyReason(e.target.value)}
								placeholder={t('denyReasonPlaceholder')}
								className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7cbc97] resize-none'
								rows={3}
							/>
						</div>

						{denyMutation.isError && (
							<div className='bg-red-50 border border-red-200 rounded-lg p-3 mb-4'>
								<p className='text-red-800 text-sm'>{tTicket('errorOccurred')}</p>
							</div>
						)}

						<div className='flex gap-3'>
							<button
								onClick={() => {
									setShowDenyDialog(false)
									setSelectedTicket(null)
								}}
								className='flex-1 py-2 px-4 rounded-lg border border-[#48715b] text-[#48715b] hover:bg-[#e9f5e7]'
							>
								{tCommon('cancel')}
							</button>
							<button
								onClick={handleDenyConfirm}
								disabled={denyMutation.isPending}
								className='flex-1 py-2 px-4 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50'
							>
								{denyMutation.isPending ? tCommon('processing') : t('confirmDeny')}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default TicketManagementPage

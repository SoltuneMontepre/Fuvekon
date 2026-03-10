'use client'

import React, { useState, useMemo } from 'react'
import {
	CheckCircle,
	RefreshCw,
	Search,
	Filter,
	ChevronLeft,
	ChevronRight,
	Shield,
	Users,
	Store,
	AlertCircle,
	XCircle,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
	useAdminGetDealers,
	useAdminVerifyDealer,
	useAdminDenyDealer,
	type AdminDealerFilter,
} from '@/hooks/services/dealer/useAdminDealer'
import type { DealerBoothDetail } from '@/types/models/dealer/dealer'
import { logger } from '@/utils/logger'

const formatDateTime = (dateString?: string): string => {
	if (!dateString) return '–'
	const date = new Date(dateString)
	return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

const createTWithFallback = (t: (key: string) => string) => {
	return (key: string, fallback: string) => {
		const translation = t(key)
		return translation && translation !== key ? translation : fallback
	}
}

const DealerManagementPage = (): React.ReactElement => {
	const tRaw = useTranslations('admin')
	const t = createTWithFallback(tRaw)
	const tCommon = useTranslations('common')

	const [filter, setFilter] = useState<AdminDealerFilter>({
		page: 1,
		page_size: 20,
	})
	const [searchInput, setSearchInput] = useState('')

	const { data: dealersData, isLoading: dealersLoading, refetch: refetchDealers } = useAdminGetDealers(filter)
	const verifyMutation = useAdminVerifyDealer()
	const denyMutation = useAdminDenyDealer()

	const dealers = useMemo(() => dealersData?.data || [], [dealersData?.data])
	const pagination = dealersData?.meta

	const stats = useMemo(() => ({
		total: pagination?.totalItems || dealers.length,
		verified: dealers.filter((d: DealerBoothDetail) => d.is_verified).length,
		unverified: dealers.filter((d: DealerBoothDetail) => !d.is_verified).length,
	}), [dealers, pagination])

	const filteredDealers = useMemo(() => {
		if (!dealers.length) return []
		if (!searchInput.trim()) return dealers

		const searchLower = searchInput.toLowerCase().trim()
		return dealers.filter((dealer: DealerBoothDetail) => {
			const boothName = dealer.booth_name?.toLowerCase() || ''
			const description = dealer.description?.toLowerCase() || ''
			const boothNumber = dealer.booth_number?.toLowerCase() || ''
			const staffNames = dealer.staffs?.map(s => s.user_name?.toLowerCase() || '').join(' ') || ''

			return (
				boothName.includes(searchLower) ||
				description.includes(searchLower) ||
				boothNumber.includes(searchLower) ||
				staffNames.includes(searchLower)
			)
		})
	}, [dealers, searchInput])

	const handleVerificationFilter = (isVerified: boolean | 'all') => {
		setFilter(prev => ({
			...prev,
			is_verified: isVerified === 'all' ? undefined : isVerified,
			page: 1,
		}))
	}

	const handleVerify = async (dealer: DealerBoothDetail) => {
		try {
			await verifyMutation.mutateAsync(dealer.id)
			toast.success(t('dealerVerified', 'Dealer verified successfully'))
		} catch (error) {
			logger.error('Failed to verify dealer', error, { dealerId: dealer.id })
			toast.error(t('verifyError', 'Failed to verify dealer. Please try again.'))
		}
	}

	const handleDeny = async (dealer: DealerBoothDetail) => {
		const dealerName = dealer.booth_name || dealer.id
		const translatedConfirm = tRaw('denyDealerConfirm', { name: dealerName })
		const confirmMessage =
			translatedConfirm && translatedConfirm !== 'denyDealerConfirm'
				? translatedConfirm
				: `Deny dealer registration for "${dealerName}"?`

		if (
			!window.confirm(
				confirmMessage
			)
		) {
			return
		}

		try {
			await denyMutation.mutateAsync(dealer.id)
			toast.success(t('dealerDenied', 'Dealer registration denied'))
		} catch (error) {
			logger.error('Failed to deny dealer', error, { dealerId: dealer.id })
			toast.error(t('denyDealerError', 'Failed to deny dealer. Please try again.'))
		}
	}

	const handlePageChange = (page: number) => {
		setFilter(prev => ({ ...prev, page }))
	}

	return (
		<div className='w-full'>
			{/* Header */}
			<div className='pb-6 border-b border-[#48715B]/15'>
				<h1 className='text-2xl font-bold text-text-primary josefin flex items-center gap-2'>
					<Store className='w-6 h-6' />
					{t('dealerManagement', 'Quản lý Dealer')}
				</h1>
				<p className='text-text-secondary mt-1'>
					{t('dealerManagementDesc', 'Quản lý và xác minh các dealer booth')}
				</p>
			</div>

			{/* Statistics Cards */}
			<div className='grid grid-cols-2 md:grid-cols-3 gap-4 mt-6'>
				<div className='rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15 p-4'>
					<p className='text-sm font-medium text-[#48715B]'>{t('totalDealers', 'Tổng số Dealer')}</p>
					<p className='text-2xl font-bold text-text-primary'>{stats.total}</p>
				</div>
				<div className='rounded-xl bg-emerald-50/80 border border-emerald-200 p-4'>
					<p className='text-sm font-medium text-emerald-700'>{t('verifiedDealers', 'Đã xác minh')}</p>
					<p className='text-2xl font-bold text-emerald-800'>{stats.verified}</p>
				</div>
				<div className='rounded-xl bg-amber-50/80 border border-amber-200 p-4'>
					<p className='text-sm font-medium text-amber-700'>{t('unverifiedDealers', 'Chưa xác minh')}</p>
					<p className='text-2xl font-bold text-amber-800'>{stats.unverified}</p>
				</div>
			</div>

			{/* Filters */}
			<div className='mt-6 rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15 p-4'>
				<div className='flex flex-wrap gap-4 items-center'>
					<div className='flex-1 min-w-[200px]'>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8C8C8C]' />
							<input
								type='text'
								placeholder={t('searchPlaceholder', 'Tìm kiếm dealer...')}
								value={searchInput}
								onChange={e => setSearchInput(e.target.value)}
								className='w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#8C8C8C]/15 text-text-secondary placeholder-[#8C8C8C]/40 focus:outline-none focus:border-[#48715B] transition-colors'
							/>
						</div>
					</div>

					<div className='flex items-center gap-2'>
						<Filter className='w-4 h-4 text-[#8C8C8C]' />
						<select
							value={filter.is_verified === undefined ? 'all' : String(filter.is_verified)}
							onChange={e => {
								const value = e.target.value
								handleVerificationFilter(value === 'all' ? 'all' : value === 'true')
							}}
							className='rounded-xl bg-white border border-[#8C8C8C]/15 px-3 py-2.5 text-text-secondary focus:outline-none focus:border-[#48715B] transition-colors'
						>
							<option value='all'>{t('allStatus', 'Tất cả')}</option>
							<option value='true'>{t('verified', 'Đã xác minh')}</option>
							<option value='false'>{t('unverified', 'Chưa xác minh')}</option>
						</select>
					</div>

					<button
						onClick={() => refetchDealers()}
						className='p-2.5 rounded-xl bg-white border border-[#8C8C8C]/15 hover:bg-[#E2EEE2] transition-colors'
						title={t('refresh', 'Làm mới')}
					>
						<RefreshCw className='w-4 h-4 text-[#48715B]' />
					</button>
				</div>
			</div>

			{/* Dealers Table */}
			<div className='mt-6'>
				{dealersLoading ? (
					<div className='p-8 text-center text-text-secondary rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15'>
						{tCommon('loading')}
					</div>
				) : filteredDealers.length === 0 ? (
					<div className='p-8 text-center text-text-secondary rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15'>
						{t('noDealers', 'Không có dealer nào')}
					</div>
				) : (
					<>
						<div className='overflow-x-auto rounded-xl border border-[#8C8C8C]/15 bg-white/50'>
							<table className='w-full'>
								<thead>
									<tr className='border-b border-[#48715B]/15 bg-[#E2EEE2]/40'>
										<th className='px-4 py-3 text-left text-sm font-semibold text-[#48715B]'>
											{t('boothName', 'Tên Booth')}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-[#48715B]'>
											{t('boothNumber', 'Số Booth')}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-[#48715B]'>
											{t('description', 'Mô tả')}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-[#48715B]'>
											{t('staff', 'Nhân viên')}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-[#48715B]'>
											{t('status', 'Trạng thái')}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-[#48715B]'>
											{t('createdAt', 'Ngày tạo')}
										</th>
										<th className='px-4 py-3 text-center text-sm font-semibold text-[#48715B]'>
											{t('actions', 'Hành động')}
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-[#48715B]/10'>
									{filteredDealers.map((dealer: DealerBoothDetail) => (
										<tr key={dealer.id} className='hover:bg-[#E2EEE2]/40 transition-colors'>
											<td className='px-4 py-3'>
												<div className='flex items-center gap-2'>
													<Store className='w-4 h-4 text-[#48715B]' />
													<span className='font-semibold text-text-primary'>
														{dealer.booth_name || '–'}
													</span>
												</div>
											</td>
											<td className='px-4 py-3'>
												{dealer.booth_number ? (
													<span className='font-mono text-sm bg-[#E2EEE2]/60 px-2 py-1 rounded-lg'>
														{dealer.booth_number}
													</span>
												) : (
													<span className='text-[#8C8C8C] text-sm'>Chưa gán</span>
												)}
											</td>
											<td className='px-4 py-3'>
												<p className='text-sm text-text-secondary line-clamp-2 max-w-xs'>
													{dealer.description || '–'}
												</p>
											</td>
											<td className='px-4 py-3'>
												{(!dealer.staffs || dealer.staffs.length === 0) ? (
													<span className='text-[#8C8C8C] text-sm'>Không có</span>
												) : (
													<div className='flex flex-col gap-1'>
														{dealer.staffs.slice(0, 2).map(staff => (
															<div key={staff.id} className='flex items-center gap-2'>
																<Users className='w-3 h-3 text-[#8C8C8C]' />
																<span className='text-sm text-text-secondary'>
																	{staff.user_name || staff.user_email}
																	{staff.is_owner && (
																		<span className='ml-1 text-xs text-[#48715B] font-medium'>(Owner)</span>
																	)}
																</span>
															</div>
														))}
														{dealer.staffs.length > 2 && (
															<p className='text-xs text-[#8C8C8C]'>+{dealer.staffs.length - 2} người khác</p>
														)}
													</div>
												)}
											</td>
											<td className='px-4 py-3'>
												<span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
													dealer.is_verified
														? 'bg-green-100 text-green-700'
														: 'bg-yellow-100 text-yellow-700'
												}`}>
													{dealer.is_verified ? <CheckCircle className='w-4 h-4' /> : <AlertCircle className='w-4 h-4' />}
													{dealer.is_verified ? t('verified', 'Đã xác minh') : t('unverified', 'Chưa xác minh')}
												</span>
											</td>
											<td className='px-4 py-3'>
												<span className='text-sm text-text-secondary'>
													{formatDateTime(dealer.created_at)}
												</span>
											</td>
											<td className='px-4 py-3'>
												<div className='flex justify-center gap-2'>
													{!dealer.is_verified ? (
														<>
															<button
																onClick={() => handleVerify(dealer)}
																disabled={verifyMutation.isPending || denyMutation.isPending}
																className='inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-400 text-emerald-700 text-sm font-medium hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed'
															>
																<Shield className='w-4 h-4' />
																{t('verify', 'Xác minh')}
															</button>
															<button
																onClick={() => handleDeny(dealer)}
																disabled={denyMutation.isPending || verifyMutation.isPending}
																className='inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 border border-red-400 text-red-700 text-sm font-medium hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed'
															>
																<XCircle className='w-4 h-4' />
																{t('denyDealer', 'Deny')}
															</button>
														</>
													) : (
														<span className='text-xs text-emerald-600 flex items-center gap-1'>
															<CheckCircle className='w-4 h-4' />
															{t('verified', 'Đã xác minh')}
														</span>
													)}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Pagination */}
						{pagination && pagination.totalPages > 1 && (
							<div className='mt-4 px-4 py-3 rounded-xl bg-[#E2EEE2]/40 border border-[#8C8C8C]/15 flex items-center justify-between'>
								<p className='text-sm text-text-secondary'>
									{tCommon('page')} {pagination.currentPage} / {pagination.totalPages}
								</p>
								<div className='flex gap-2'>
									<button
										onClick={() => handlePageChange(pagination.currentPage - 1)}
										disabled={pagination.currentPage <= 1}
										className='p-2 rounded-xl border border-[#8C8C8C]/15 hover:bg-[#E2EEE2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
									>
										<ChevronLeft className='w-4 h-4 text-[#48715B]' />
									</button>
									<button
										onClick={() => handlePageChange(pagination.currentPage + 1)}
										disabled={pagination.currentPage >= pagination.totalPages}
										className='p-2 rounded-xl border border-[#8C8C8C]/15 hover:bg-[#E2EEE2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
									>
										<ChevronRight className='w-4 h-4 text-[#48715B]' />
									</button>
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	)
}

export default DealerManagementPage

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
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
	useAdminGetDealers,
	useAdminVerifyDealer,
	type AdminDealerFilter,
} from '@/hooks/services/dealer/useAdminDealer'
import type { DealerBoothDetail } from '@/types/models/dealer/dealer'
import { logger } from '@/utils/logger'

// ========== Helper Functions ==========
const formatDateTime = (dateString?: string): string => {
	if (!dateString) return '–'
	const date = new Date(dateString)
	return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

// Translation helper function with fallback
const createTWithFallback = (t: (key: string) => string) => {
	return (key: string, fallback: string) => {
		const translation = t(key)
		return translation && translation !== key ? translation : fallback
	}
}

// ========== Reusable Components ==========

interface StatCardProps {
	label: string
	value: number | string
	bgColor?: string
	borderColor?: string
	textColor?: string
}

const StatCard: React.FC<StatCardProps> = ({
	label,
	value,
	bgColor = 'bg-white',
	borderColor = 'border',
	textColor = 'text-[#154c5b]',
}) => (
	<div className={`${bgColor} rounded-lg p-4 shadow-sm ${borderColor}`}>
		<p className='text-sm text-gray-500'>{label}</p>
		<p className={`text-2xl font-bold ${textColor}`}>{value}</p>
	</div>
)

interface StatusBadgeProps {
	isVerified: boolean
	label: string
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ isVerified, label }) => {
	const Icon = isVerified ? CheckCircle : AlertCircle
	const bgColor = isVerified ? 'bg-green-100' : 'bg-yellow-100'
	const textColor = isVerified ? 'text-green-700' : 'text-yellow-700'

	return (
		<span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
			<Icon className='w-4 h-4' />
			{label}
		</span>
	)
}

interface StaffListProps {
	staffs?: Array<{ id: string; user_name?: string; user_email?: string; is_owner?: boolean }>
}

const StaffList: React.FC<StaffListProps> = ({ staffs }) => {
	if (!staffs || staffs.length === 0) {
		return <span className='text-gray-400 text-sm'>Không có</span>
	}

	return (
		<div className='flex flex-col gap-1'>
			{staffs.slice(0, 2).map(staff => (
				<div key={staff.id} className='flex items-center gap-2'>
					<Users className='w-3 h-3 text-gray-400' />
					<span className='text-sm text-gray-700'>
						{staff.user_name || staff.user_email}
						{staff.is_owner && (
							<span className='ml-1 text-xs text-[#7cbc97] font-medium'>(Owner)</span>
						)}
					</span>
				</div>
			))}
			{staffs.length > 2 && (
				<p className='text-xs text-gray-500'>+{staffs.length - 2} người khác</p>
			)}
		</div>
	)
}

interface TableCellProps {
	children: React.ReactNode
	className?: string
}

const TableCell: React.FC<TableCellProps> = ({ children, className = '' }) => (
	<td className={`px-4 py-3 ${className}`}>{children}</td>
)

interface PaginationProps {
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
	pageLabel: string
}

const Pagination: React.FC<PaginationProps> = ({
	currentPage,
	totalPages,
	onPageChange,
	pageLabel,
}) => {
	if (totalPages <= 1) return null

	return (
		<div className='px-4 py-3 border-t flex items-center justify-between'>
			<p className='text-sm text-gray-600'>{pageLabel}</p>
			<div className='flex gap-2'>
				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage <= 1}
					className='p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
				>
					<ChevronLeft className='w-4 h-4' />
				</button>
				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage >= totalPages}
					className='p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
				>
					<ChevronRight className='w-4 h-4' />
				</button>
			</div>
		</div>
	)
}

// ========== Main Component ==========
const DealerManagementPage = (): React.ReactElement => {
	const tRaw = useTranslations('admin')
	const t = createTWithFallback(tRaw)
	const tCommon = useTranslations('common')

	// Filter state
	const [filter, setFilter] = useState<AdminDealerFilter>({
		page: 1,
		page_size: 20,
	})
	const [searchInput, setSearchInput] = useState('')

	// Queries
	const { data: dealersData, isLoading: dealersLoading, refetch: refetchDealers } = useAdminGetDealers(filter)
	const verifyMutation = useAdminVerifyDealer()

	const dealers = useMemo(() => dealersData?.data || [], [dealersData?.data])
	const pagination = dealersData?.meta

	// Calculate statistics
	const stats = useMemo(() => ({
		total: pagination?.totalItems || dealers.length,
		verified: dealers.filter((d: DealerBoothDetail) => d.is_verified).length,
		unverified: dealers.filter((d: DealerBoothDetail) => !d.is_verified).length,
	}), [dealers, pagination])

	// Client-side search filtering
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

	// Handlers
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

	const handlePageChange = (page: number) => {
		setFilter(prev => ({ ...prev, page }))
	}

	return (
		<div id='dealer-management-page' className='dealer-management-page w-full'>
			{/* Header */}
			<div id='dealer-management-header' className='dealer-management-header mb-6'>
				<h1 className='text-2xl font-bold text-[#154c5b] dark:text-dark-text'>
					{t('dealerManagement', 'Quản lý Dealer')}
				</h1>
				<p className='text-[#48715b] dark:text-dark-text-secondary'>
					{t('dealerManagementDesc', 'Quản lý và xác minh các dealer booth')}
				</p>
			</div>

			{/* Statistics Cards */}
			<div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-6'>
				<StatCard
					label={t('totalDealers', 'Tổng số Dealer')}
					value={stats.total}
				/>
				<StatCard
					label={t('verifiedDealers', 'Đã xác minh')}
					value={stats.verified}
					bgColor='bg-green-50'
					borderColor='border border-green-200'
					textColor='text-green-700'
				/>
				<StatCard
					label={t('unverifiedDealers', 'Chưa xác minh')}
					value={stats.unverified}
					bgColor='bg-yellow-50'
					borderColor='border border-yellow-200'
					textColor='text-yellow-700'
				/>
			</div>

			{/* Filters */}
			<div className='bg-white rounded-lg shadow-sm border p-4 mb-6'>
				<div className='flex flex-wrap gap-4 items-center'>
					{/* Search */}
					<div className='flex-1 min-w-[200px] flex gap-2'>
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
							<input
								type='text'
								placeholder={t('searchPlaceholder', 'Tìm kiếm dealer...')}
								value={searchInput}
								onChange={e => setSearchInput(e.target.value)}
								onKeyDown={e => e.key === 'Enter'}
								className='w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7cbc97]'
							/>
						</div>
						<button
							onClick={() => {}}
							className='px-4 py-2 bg-[#7cbc97] text-white rounded-lg hover:bg-[#6aab85]'
						>
							{t('search', 'Tìm kiếm')}
						</button>
					</div>

					{/* Verification Status Filter */}
					<div className='flex items-center gap-2'>
						<Filter className='w-4 h-4 text-gray-400' />
						<select
							value={filter.is_verified === undefined ? 'all' : String(filter.is_verified)}
							onChange={e => {
								const value = e.target.value
								handleVerificationFilter(value === 'all' ? 'all' : value === 'true')
							}}
							className='border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7cbc97]'
						>
							<option value='all'>{t('allStatus', 'Tất cả')}</option>
							<option value='true'>{t('verified', 'Đã xác minh')}</option>
							<option value='false'>{t('unverified', 'Chưa xác minh')}</option>
						</select>
					</div>

					{/* Refresh Button */}
					<button
						onClick={() => refetchDealers()}
						className='p-2 border rounded-lg hover:bg-gray-50'
						title={t('refresh', 'Làm mới')}
					>
						<RefreshCw className='w-4 h-4 text-gray-600' />
					</button>
				</div>
			</div>

			{/* Dealers Table */}
			<div className='bg-white rounded-lg shadow-sm border overflow-hidden'>
				{dealersLoading ? (
					<div className='p-8 text-center text-gray-500'>{tCommon('loading')}</div>
				) : filteredDealers.length === 0 ? (
					<div className='p-8 text-center text-gray-500'>{t('noDealers', 'Không có dealer nào')}</div>
				) : (
					<>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead className='bg-gray-50 border-b'>
									<tr>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>
											{t('boothName', 'Tên Booth')}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>
											{t('boothNumber', 'Số Booth')}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>
											{t('description', 'Mô tả')}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>
											{t('staff', 'Nhân viên')}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>
											{t('status', 'Trạng thái')}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>
											{t('createdAt', 'Ngày tạo')}
										</th>
										<th className='px-4 py-3 text-center text-sm font-semibold text-gray-600'>
											{t('actions', 'Hành động')}
										</th>
									</tr>
								</thead>
								<tbody className='divide-y'>
									{filteredDealers.map((dealer: DealerBoothDetail) => (
										<tr key={dealer.id} className='hover:bg-gray-50'>
											<TableCell>
												<div className='flex items-center gap-2'>
													<Store className='w-4 h-4 text-[#7cbc97]' />
													<span className='font-semibold text-[#154c5b]'>
														{dealer.booth_name || '–'}
													</span>
												</div>
											</TableCell>
											<TableCell>
												{dealer.booth_number ? (
													<span className='font-mono text-sm bg-gray-100 px-2 py-1 rounded'>
														{dealer.booth_number}
													</span>
												) : (
													<span className='text-gray-400 text-sm'>Chưa gán</span>
												)}
											</TableCell>
											<TableCell>
												<p className='text-sm text-gray-600 line-clamp-2 max-w-xs'>
													{dealer.description || '–'}
												</p>
											</TableCell>
											<TableCell>
												<StaffList staffs={dealer.staffs} />
											</TableCell>
											<TableCell>
												<StatusBadge
													isVerified={dealer.is_verified}
													label={dealer.is_verified ? t('verified', 'Đã xác minh') : t('unverified', 'Chưa xác minh')}
												/>
											</TableCell>
											<TableCell>
												<span className='text-sm text-gray-600'>
													{formatDateTime(dealer.created_at)}
												</span>
											</TableCell>
											<TableCell>
												<div className='flex justify-center gap-2'>
													{!dealer.is_verified ? (
														<button
															onClick={() => handleVerify(dealer)}
															disabled={verifyMutation.isPending}
															className='px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1'
														>
															<Shield className='w-4 h-4' />
															{t('verify', 'Xác minh')}
														</button>
													) : (
														<span className='text-xs text-green-600 flex items-center gap-1'>
															<CheckCircle className='w-4 h-4' />
															{t('verified', 'Đã xác minh')}
														</span>
													)}
												</div>
											</TableCell>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{pagination && (
							<Pagination
								currentPage={pagination.currentPage}
								totalPages={pagination.totalPages}
								onPageChange={handlePageChange}
								pageLabel={t('page', `Trang ${pagination.currentPage} / ${pagination.totalPages}`) || 
									`Trang ${pagination.currentPage} / ${pagination.totalPages}`}
							/>
						)}
					</>
				)}
			</div>
		</div>
	)
}

export default DealerManagementPage

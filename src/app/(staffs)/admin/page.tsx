'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
	UserCircle,
	RefreshCw,
	ChevronLeft,
	ChevronRight,
	CheckCircle,
	XCircle,
	Shield,
	Search,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
	useAdminGetUsers,
	type AdminUserFilter,
} from '@/hooks/services/user/useAdminUser'
import type { Account } from '@/types/models/auth/account'
import Loading from '@/components/common/Loading'

const SEARCH_DEBOUNCE_MS = 400

// Format datetime
const formatDateTime = (dateString?: string): string => {
	if (!dateString) return '–'
	const date = new Date(dateString)
	return (
		date.toLocaleDateString('vi-VN') +
		' ' +
		date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
	)
}

// Get role display
const getRoleDisplay = (
	role?: string
): { label: string; color: string; bgColor: string } => {
	const roleMap: Record<
		string,
		{ label: string; color: string; bgColor: string }
	> = {
		admin: {
			label: 'Admin',
			color: 'text-purple-700',
			bgColor: 'bg-purple-100',
		},
		staff: { label: 'Staff', color: 'text-blue-700', bgColor: 'bg-blue-100' },
		user: { label: 'User', color: 'text-gray-700', bgColor: 'bg-gray-100' },
	}
	return roleMap[role?.toLowerCase() || 'user'] || roleMap.user
}

const UserManagementPage = (): React.ReactElement => {
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')
	const router = useRouter()

	// Filter state (server-side pagination)
	const [filter, setFilter] = useState<AdminUserFilter>({
		page: 1,
		pageSize: 20,
	})
	const [searchInput, setSearchInput] = useState('')
	const [appliedSearch, setAppliedSearch] = useState('')
	const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	// Debounce search; when it updates, reset to page 1
	useEffect(() => {
		if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
		searchDebounceRef.current = setTimeout(() => {
			setAppliedSearch(searchInput.trim())
			setFilter(prev => ({ ...prev, page: 1 }))
		}, SEARCH_DEBOUNCE_MS)
		return () => {
			if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
		}
	}, [searchInput])

	// API filter: pagination + debounced search
	const apiFilter: AdminUserFilter = {
		page: filter.page,
		pageSize: filter.pageSize,
		...(appliedSearch ? { search: appliedSearch } : {}),
	}
	const {
		data: usersData,
		isLoading: usersLoading,
		isFetching: usersFetching,
		refetch: refetchUsers,
	} = useAdminGetUsers(apiFilter)

	const users: Account[] = usersData?.data ?? []
	const meta = usersData?.meta
	const currentPage = meta?.currentPage ?? filter.page ?? 1
	const pageSize = meta?.pageSize ?? filter.pageSize ?? 20
	const totalPages = meta?.totalPages ?? 1
	const totalItems = meta?.totalItems ?? 0
	const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
	const endIndex = Math.min(currentPage * pageSize, Number(totalItems))

	// Pagination handlers
	const handlePageChange = (page: number) => {
		setFilter(prev => ({ ...prev, page }))
	}

	const handlePageSizeChange = (pageSize: number) => {
		setFilter(prev => ({ ...prev, pageSize, page: 1 }))
	}

	if (usersLoading) {
		return <Loading />
	}

	return (
		<div id='user-management-page' className='user-management-page w-full'>
			{/* Header */}
			<div id='user-management-header' className='user-management-header mb-6'>
				<h1 className='text-2xl font-bold text-[#154c5b] dark:text-dark-text flex items-center gap-2'>
					<UserCircle className='w-6 h-6' />
					{t('userManagement') || 'User Management'}
				</h1>
				<p className='text-[#48715b] dark:text-dark-text-secondary mt-1'>
					{t('userManagementDesc') || 'View and manage all users'}
				</p>
			</div>

			{/* Controls */}
			<div className=' rounded-lg shadow-sm border border-slate-300/20 dark:border-dark-border/20 p-4 mb-6'>
				<div className='flex flex-wrap gap-4 items-center'>
					{/* Search */}
					<div className='flex-1 min-w-[200px] flex gap-2'>
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
							<input
								type='text'
								placeholder={
									t('searchPlaceholder') ||
									'Search by email, name, fursona name...'
								}
								value={searchInput}
								onChange={e => setSearchInput(e.target.value)}
								className='w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7cbc97] dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'
							/>
						</div>
					</div>

					{/* Page Size Selector */}
					<div className='flex items-center gap-2'>
						<span className='text-sm text-gray-600 dark:text-dark-text-secondary'>
							{tCommon('itemsPerPage') || 'Items per page'}:
						</span>
						<select
							value={filter.pageSize}
							onChange={e => handlePageSizeChange(Number(e.target.value))}
							className='border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7cbc97] dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'
						>
							<option value={10}>10</option>
							<option value={20}>20</option>
							<option value={50}>50</option>
							<option value={100}>100</option>
						</select>
					</div>

					{/* Refresh Button */}
					<button
						onClick={() => refetchUsers()}
						className='p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors'
						title={t('refresh') || 'Refresh'}
					>
						<RefreshCw className='w-4 h-4 text-gray-600 dark:text-dark-text' />
					</button>
				</div>
			</div>

			{/* Users Table */}
			<div className=' rounded-lg   overflow-hidden'>
				{users.length === 0 ? (
					<div className='p-8 text-center text-gray-500 dark:text-dark-text-secondary'>
						{appliedSearch
							? (t('noSearchResults') || 'No users found matching your search')
							: (t('noUsers') || 'No users found')}
					</div>
				) : (
					<>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead className=''>
									<tr>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-dark-text'>
											{t('user') || 'User'}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-dark-text'>
											{t('email') || 'Email'}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-dark-text'>
											{t('role') || 'Role'}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-dark-text'>
											{t('status') || 'Status'}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-dark-text'>
											{t('createdAt') || 'Created At'}
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-slate-300/20 dark:divide-dark-border/20'>
									{users.map((user: Account) => {
										const roleDisplay = getRoleDisplay(user.role)
										return (
											<tr
												key={user.id}
												role='button'
												tabIndex={0}
												onClick={() => router.push(`/admin/users/${user.id}`)}
												onKeyDown={e => {
													if (e.key === 'Enter' || e.key === ' ') {
														e.preventDefault()
														router.push(`/admin/users/${user.id}`)
													}
												}}
												className='hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors cursor-pointer'
											>
												<td className='px-4 py-3'>
													<div className='flex items-center gap-3'>
														<div>
															<p className='font-medium text-gray-900 dark:text-dark-text'>
																{user.first_name || user.last_name
																	? `${user.first_name || ''} ${user.last_name || ''}`.trim()
																	: user.fursona_name || user.email}
															</p>
															{user.fursona_name && (
																<p className='text-xs text-[#48715b] dark:text-dark-text-secondary'>
																	({user.fursona_name})
																</p>
															)}
															{user.country && (
																<p className='text-xs text-gray-500 dark:text-dark-text-secondary'>
																	{user.country}
																</p>
															)}
														</div>
													</div>
												</td>
												<td className='px-4 py-3'>
													<p className='text-sm text-gray-900 dark:text-dark-text'>
														{user.email}
													</p>
												</td>
												<td className='px-4 py-3'>
													<span
														className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleDisplay.bgColor} ${roleDisplay.color}`}
													>
														<Shield className='w-3 h-3' />
														{roleDisplay.label}
													</span>
												</td>
												<td className='px-4 py-3'>
													<div className='flex flex-col gap-1'>
														{user.is_verified !== undefined && (
															<span
																className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${
																	user.is_verified
																		? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
																		: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
																}`}
															>
																{user.is_verified ? (
																	<CheckCircle className='w-3 h-3' />
																) : (
																	<XCircle className='w-3 h-3' />
																)}
																{user.is_verified
																	? t('verified') || 'Verified'
																	: t('unverified') || 'Unverified'}
															</span>
														)}
														{user.is_blacklisted && (
															<span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'>
																<XCircle className='w-3 h-3' />
																{t('blacklisted') || 'Blacklisted'}
															</span>
														)}
														{user.denial_count !== undefined &&
															user.denial_count > 0 && (
																<span className='text-xs text-orange-600 dark:text-orange-400'>
																	{t('denials') || 'Denials'}:{' '}
																	{user.denial_count}
																</span>
															)}
													</div>
												</td>
												<td className='px-4 py-3 text-sm text-gray-600 dark:text-dark-text-secondary'>
													{formatDateTime(user.created_at)}
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>

						{/* Pagination */}
						{totalItems > 0 && (
							<div className='px-4 py-3 border-t border-slate-300/20 dark:border-dark-border/20 bg-gray-50 dark:bg-dark-surface/50'>
								<div className='flex items-center justify-between'>
									<div className='text-sm text-gray-600 dark:text-dark-text-secondary'>
										{tCommon('showing') || 'Showing'} {startIndex}{' '}
										{tCommon('to') || 'to'} {endIndex}{' '}
										{tCommon('of') || 'of'} {totalItems}{' '}
										{tCommon('results') || 'results'}
										{appliedSearch && (
											<span className='ml-2 text-xs text-gray-500'>
												({tCommon('filtered') || 'filtered'})
											</span>
										)}
									</div>
									<div className='flex items-center gap-2'>
										<button
											onClick={() => handlePageChange(currentPage - 1)}
											disabled={currentPage <= 1 || usersFetching}
											className='p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
											aria-label={tCommon('previousPage') || 'Previous page'}
										>
											<ChevronLeft className='w-4 h-4' />
										</button>
										<span className='text-sm text-gray-600 dark:text-dark-text-secondary px-2 flex items-center gap-1'>
											{tCommon('page') || 'Page'} {currentPage}{' '}
											{tCommon('of') || 'of'} {totalPages || 1}
											{usersFetching && (
												<span className='inline-block w-4 h-4 border-2 border-gray-300 border-t-[#7cbc97] rounded-full animate-spin' aria-hidden />
											)}
										</span>
										<button
											onClick={() => handlePageChange(currentPage + 1)}
											disabled={currentPage >= totalPages || usersFetching}
											className='p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
											aria-label={tCommon('nextPage') || 'Next page'}
										>
											<ChevronRight className='w-4 h-4' />
										</button>
									</div>
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	)
}

export default UserManagementPage

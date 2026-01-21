'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { UserCircle, RefreshCw, ChevronLeft, ChevronRight, CheckCircle, XCircle, Shield, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAdminGetUsers, type AdminUserFilter } from '@/hooks/services/user/useAdminUser'
import type { Account } from '@/types/models/auth/account'
import Loading from '@/components/common/Loading'
import Image from 'next/image'

// Format datetime
const formatDateTime = (dateString?: string): string => {
	if (!dateString) return '–'
	const date = new Date(dateString)
	return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

// Get role display
const getRoleDisplay = (role?: string): { label: string; color: string; bgColor: string } => {
	const roleMap: Record<string, { label: string; color: string; bgColor: string }> = {
		admin: { label: 'Admin', color: 'text-purple-700', bgColor: 'bg-purple-100' },
		staff: { label: 'Staff', color: 'text-blue-700', bgColor: 'bg-blue-100' },
		user: { label: 'User', color: 'text-gray-700', bgColor: 'bg-gray-100' },
	}
	return roleMap[role?.toLowerCase() || 'user'] || roleMap.user
}

const UserManagementPage = (): React.ReactElement => {
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')

	// Filter state
	const [filter, setFilter] = useState<AdminUserFilter>({
		page: 1,
		pageSize: 20,
	})
	const [searchInput, setSearchInput] = useState('')

	// Query - fetch all users (we'll do client-side filtering)
	const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useAdminGetUsers({
		page: 1,
		pageSize: 1000, // Fetch more to enable client-side search
	})

	// Client-side search filtering
	const allUsers = usersData?.data || []
	const filteredUsers = useMemo(() => {
		if (!allUsers.length) return []
		
		if (!searchInput.trim()) {
			return allUsers
		}

		const searchLower = searchInput.toLowerCase().trim()
		return allUsers.filter((user: Account) => {
			const email = user.email?.toLowerCase() || ''
			const firstName = user.first_name?.toLowerCase() || ''
			const lastName = user.last_name?.toLowerCase() || ''
			const fursonaName = user.fursona_name?.toLowerCase() || ''
			const country = user.country?.toLowerCase() || ''
			const fullName = `${firstName} ${lastName}`.trim()

			return (
				email.includes(searchLower) ||
				firstName.includes(searchLower) ||
				lastName.includes(searchLower) ||
				fullName.includes(searchLower) ||
				fursonaName.includes(searchLower) ||
				country.includes(searchLower)
			)
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allUsers, searchInput])

	// Client-side pagination
	const currentPage: number = filter.page ?? 1
	const pageSize: number = filter.pageSize ?? 20
	const totalFiltered = filteredUsers.length
	const totalPages = Math.ceil(totalFiltered / pageSize)
	const startIndex = (currentPage - 1) * pageSize
	const endIndex = startIndex + pageSize
	const users = filteredUsers.slice(startIndex, endIndex)

	// Reset to page 1 when search changes
	useEffect(() => {
		setFilter(prev => ({ ...prev, page: 1 }))
	}, [searchInput])

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
								placeholder={t('searchPlaceholder') || 'Search by email, name, fursona name...'}
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
				{allUsers.length === 0 ? (
					<div className='p-8 text-center text-gray-500 dark:text-dark-text-secondary'>
						{t('noUsers') || 'No users found'}
					</div>
				) : filteredUsers.length === 0 ? (
					<div className='p-8 text-center text-gray-500 dark:text-dark-text-secondary'>
						{t('noSearchResults') || 'No users found matching your search'}
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
											<tr key={user.id} className='hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors'>
												<td className='px-4 py-3'>
													<div className='flex items-center gap-3'>
														{user.avatar ? (
															<Image
																src={user.avatar}
																alt={user.fursona_name || user.email}
																className='w-10 h-10 rounded-full object-cover'
																width={40}
																height={40}
															/>
														) : (
															<div className='w-10 h-10 rounded-full bg-gray-200 dark:bg-dark-surface flex items-center justify-center'>
																<UserCircle className='w-6 h-6 text-gray-400' />
															</div>
														)}
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
													<p className='text-sm text-gray-900 dark:text-dark-text'>{user.email}</p>
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
																{user.is_verified ? t('verified') || 'Verified' : t('unverified') || 'Unverified'}
															</span>
														)}
														{user.is_blacklisted && (
															<span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'>
																<XCircle className='w-3 h-3' />
																{t('blacklisted') || 'Blacklisted'}
															</span>
														)}
														{user.denial_count !== undefined && user.denial_count > 0 && (
															<span className='text-xs text-orange-600 dark:text-orange-400'>
																{t('denials') || 'Denials'}: {user.denial_count}
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
						{totalPages > 1 && (
							<div className='px-4 py-3 border-t border-slate-300/20 dark:border-dark-border/20 bg-gray-50 dark:bg-dark-surface/50'>
								<div className='flex items-center justify-between'>
									<div className='text-sm text-gray-600 dark:text-dark-text-secondary'>
										{tCommon('showing') || 'Showing'} {startIndex + 1}{' '}
										{tCommon('to') || 'to'}{' '}
										{Math.min(endIndex, totalFiltered)} {tCommon('of') || 'of'}{' '}
										{totalFiltered} {tCommon('results') || 'results'}
										{searchInput && (
											<span className='ml-2 text-xs text-gray-500'>
												({tCommon('filtered') || 'filtered'})
											</span>
										)}
									</div>
									<div className='flex items-center gap-2'>
										<button
											onClick={() => handlePageChange(currentPage - 1)}
											disabled={currentPage === 1}
											className='p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
										>
											<ChevronLeft className='w-4 h-4' />
										</button>
										<span className='text-sm text-gray-600 dark:text-dark-text-secondary px-2'>
											{tCommon('page') || 'Page'} {currentPage} {tCommon('of') || 'of'}{' '}
											{totalPages}
										</span>
										<button
											onClick={() => handlePageChange(currentPage + 1)}
											disabled={currentPage >= totalPages}
											className='p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
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

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
	Ban,
	CircleCheck,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
	useAdminGetUsers,
	type AdminUserFilter,
} from '@/hooks/services/user/useAdminUser'
import {
	useBlacklistUser,
	useUnblacklistUser,
} from '@/hooks/services/ticket/useAdminTicket'
import type { Account } from '@/types/models/auth/account'
import Loading from '@/components/common/Loading'
import BanUserModal from '@/components/admin/BanUserModal'
import UserAvatar from '@/components/common/UserAvatar'

const SEARCH_DEBOUNCE_MS = 400

const formatDateTime = (dateString?: string): string => {
	if (!dateString) return '–'
	const date = new Date(dateString)
	return (
		date.toLocaleDateString('vi-VN') +
		' ' +
		date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
	)
}

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

	const [filter, setFilter] = useState<AdminUserFilter>({
		page: 1,
		pageSize: 20,
	})
	const [searchInput, setSearchInput] = useState('')
	const [appliedSearch, setAppliedSearch] = useState('')
	const [banTargetUser, setBanTargetUser] = useState<Account | null>(null)
	const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
	const blacklistMutation = useBlacklistUser()
	const unblacklistMutation = useUnblacklistUser()

	const users: Account[] = usersData?.data ?? []

	const handleBanClick = (e: React.MouseEvent, user: Account) => {
		e.stopPropagation()
		const role = user.role?.toLowerCase()
		if (role === 'admin' || role === 'staff') {
			toast.error(t('cannotBanStaffOrAdmin') || 'Cannot ban admin or staff.')
			return
		}
		setBanTargetUser(user)
	}

	const handleBanConfirm = async (reason: string) => {
		if (!banTargetUser) return
		try {
			await blacklistMutation.mutateAsync({
				userId: banTargetUser.id,
				reason: reason.trim(),
			})
			toast.success(t('userBanned') || 'User banned.')
			setBanTargetUser(null)
		} catch {
			toast.error(t('banFailed') || 'Failed to ban user.')
		}
	}

	const handleUnban = async (e: React.MouseEvent, user: Account) => {
		e.stopPropagation()
		if (!window.confirm(t('unbanConfirm') || `Unban ${user.email || user.id}?`))
			return
		try {
			await unblacklistMutation.mutateAsync(user.id)
			toast.success(t('userUnbanned') || 'User unbanned.')
		} catch {
			toast.error(t('unbanFailed') || 'Failed to unban user.')
		}
	}

	const meta = usersData?.meta
	const currentPage = meta?.currentPage ?? filter.page ?? 1
	const pageSize = meta?.pageSize ?? filter.pageSize ?? 20
	const totalPages = meta?.totalPages ?? 1
	const totalItems = meta?.totalItems ?? 0
	const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
	const endIndex = Math.min(currentPage * pageSize, Number(totalItems))

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
		<div className='w-full'>
			{/* Header */}
			<div className='pb-6 border-b border-[#48715B]/15'>
				<h1 className='text-2xl font-bold text-text-primary josefin flex items-center gap-2'>
					<UserCircle className='w-6 h-6' />
					{t('userManagement') || 'User Management'}
				</h1>
				<p className='text-text-secondary mt-1'>
					{t('userManagementDesc') || 'View and manage all users'}
				</p>
			</div>

			{/* Controls */}
			<div className='mt-6 rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15 p-4'>
				<div className='flex flex-wrap gap-4 items-center'>
					<div className='flex-1 min-w-[200px]'>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8C8C8C]' />
							<input
								type='text'
								placeholder={
									t('searchPlaceholder') ||
									'Search by email, name, nickname...'
								}
								value={searchInput}
								onChange={e => setSearchInput(e.target.value)}
								className='w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#8C8C8C]/15 text-text-secondary placeholder-[#8C8C8C]/40 focus:outline-none focus:border-[#48715B] transition-colors'
							/>
						</div>
					</div>

					<div className='flex items-center gap-2'>
						<span className='text-sm font-medium text-[#48715B]'>
							{tCommon('itemsPerPage') || 'Items per page'}:
						</span>
						<select
							value={filter.pageSize}
							onChange={e => handlePageSizeChange(Number(e.target.value))}
							className='rounded-xl bg-white border border-[#8C8C8C]/15 px-3 py-2.5 text-text-secondary focus:outline-none focus:border-[#48715B] transition-colors'
						>
							<option value={10}>10</option>
							<option value={20}>20</option>
							<option value={50}>50</option>
							<option value={100}>100</option>
						</select>
					</div>

					<button
						onClick={() => refetchUsers()}
						className='p-2.5 rounded-xl bg-white border border-[#8C8C8C]/15 hover:bg-[#E2EEE2] transition-colors'
						title={t('refresh') || 'Refresh'}
					>
						<RefreshCw className='w-4 h-4 text-[#48715B]' />
					</button>
				</div>
			</div>

			{/* Users Table */}
			<div className='mt-6'>
				{users.length === 0 ? (
					<div className='p-8 text-center text-text-secondary rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15'>
						{appliedSearch
							? t('noSearchResults') || 'No users found matching your search'
							: t('noUsers') || 'No users found'}
					</div>
				) : (
					<>
						<div className='overflow-x-auto rounded-xl border border-[#8C8C8C]/15 bg-white/50'>
							<table className='w-full'>
								<thead>
									<tr className='border-b border-[#48715B]/15 bg-[#E2EEE2]/40'>
										<th className='px-4 py-3 text-left text-sm font-semibold text-[#48715B]'>
											{t('user') || 'User'}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-[#48715B]'>
											{t('email') || 'Email'}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-[#48715B]'>
											{t('role') || 'Role'}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-[#48715B]'>
											{t('status') || 'Status'}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-[#48715B]'>
											{t('createdAt') || 'Created At'}
										</th>
										<th className='px-4 py-3 text-right text-sm font-semibold text-[#48715B]'>
											{t('actions') || 'Actions'}
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-[#48715B]/10'>
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
												className='hover:bg-[#E2EEE2]/40 transition-colors cursor-pointer'
											>
												<td className='px-4 py-3'>
													<div className='flex items-center gap-3'>
														<UserAvatar account={user} size={36} />
														<div>
															<p className='font-medium text-text-primary'>
																{user.first_name || user.last_name
																	? `${user.first_name || ''} ${user.last_name || ''}`.trim()
																	: user.fursona_name || user.email}
															</p>
															{user.fursona_name && (
																<p className='text-xs text-[#48715B]'>
																	({user.fursona_name})
																</p>
															)}
															{user.country && (
																<p className='text-xs text-[#8C8C8C]'>
																	{user.country}
																</p>
															)}
														</div>
													</div>
												</td>
												<td className='px-4 py-3'>
													<p className='text-sm text-text-secondary'>
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
																		? 'bg-green-100 text-green-700'
																		: 'bg-yellow-100 text-yellow-700'
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
														{(user.is_banned ?? user.is_blacklisted) && (
															<span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit bg-red-100 text-red-700'>
																<XCircle className='w-3 h-3' />
																{t('blacklisted') || 'Blacklisted'}
															</span>
														)}
														{user.denial_count !== undefined &&
															user.denial_count > 0 && (
																<span className='text-xs text-orange-600'>
																	{t('denials') || 'Denials'}:{' '}
																	{user.denial_count}
																</span>
															)}
													</div>
												</td>
												<td className='px-4 py-3 text-sm text-text-secondary'>
													{formatDateTime(user.created_at)}
												</td>
												<td
													className='px-4 py-3 text-right'
													onClick={e => e.stopPropagation()}
												>
													{(user.is_banned ?? user.is_blacklisted) ? (
														<button
															type='button'
															onClick={e => handleUnban(e, user)}
															disabled={unblacklistMutation.isPending}
															className='inline-flex items-center gap-1.5 rounded-xl border border-emerald-400 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50'
															title={t('unban') || 'Unban'}
														>
															<CircleCheck className='h-3.5 w-3.5' />
															{t('unban') || 'Unban'}
														</button>
													) : (
														<button
															type='button'
															onClick={e => handleBanClick(e, user)}
															disabled={
																blacklistMutation.isPending ||
																user.role?.toLowerCase() === 'admin' ||
																user.role?.toLowerCase() === 'staff'
															}
															className='inline-flex items-center gap-1.5 rounded-xl border border-red-400 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed'
															title={
																user.role?.toLowerCase() === 'admin' ||
																user.role?.toLowerCase() === 'staff'
																	? t('cannotBanStaffOrAdmin') ||
																		'Cannot ban admin or staff'
																	: t('ban') || 'Ban'
															}
														>
															<Ban className='h-3.5 w-3.5' />
															{t('ban') || 'Ban'}
														</button>
													)}
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>

						{/* Pagination */}
						{totalItems > 0 && (
							<div className='mt-4 px-4 py-3 rounded-xl bg-[#E2EEE2]/40 border border-[#8C8C8C]/15'>
								<div className='flex items-center justify-between'>
									<div className='text-sm text-text-secondary'>
										{tCommon('showing') || 'Showing'} {startIndex}{' '}
										{tCommon('to') || 'to'} {endIndex} {tCommon('of') || 'of'}{' '}
										{totalItems} {tCommon('results') || 'results'}
										{appliedSearch && (
											<span className='ml-2 text-xs text-[#8C8C8C]'>
												({tCommon('filtered') || 'filtered'})
											</span>
										)}
									</div>
									<div className='flex items-center gap-2'>
										<button
											onClick={() => handlePageChange(currentPage - 1)}
											disabled={currentPage <= 1 || usersFetching}
											className='p-2 rounded-xl border border-[#8C8C8C]/15 hover:bg-[#E2EEE2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
											aria-label={tCommon('previousPage') || 'Previous page'}
										>
											<ChevronLeft className='w-4 h-4 text-[#48715B]' />
										</button>
										<span className='text-sm text-text-secondary px-2 flex items-center gap-1'>
											{tCommon('page') || 'Page'} {currentPage}{' '}
											{tCommon('of') || 'of'} {totalPages || 1}
											{usersFetching && (
												<span
													className='inline-block w-4 h-4 border-2 border-[#8C8C8C]/30 border-t-[#48715B] rounded-full animate-spin'
													aria-hidden
												/>
											)}
										</span>
										<button
											onClick={() => handlePageChange(currentPage + 1)}
											disabled={currentPage >= totalPages || usersFetching}
											className='p-2 rounded-xl border border-[#8C8C8C]/15 hover:bg-[#E2EEE2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
											aria-label={tCommon('nextPage') || 'Next page'}
										>
											<ChevronRight className='w-4 h-4 text-[#48715B]' />
										</button>
									</div>
								</div>
							</div>
						)}
					</>
				)}
			</div>

			<BanUserModal
				user={banTargetUser}
				onClose={() => setBanTargetUser(null)}
				onConfirm={handleBanConfirm}
				isPending={blacklistMutation.isPending}
			/>
		</div>
	)
}

export default UserManagementPage

'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
	AlertCircle,
	Camera,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	FileText,
	// Filter,
	RefreshCw,
	Search,
	// ShieldCheck,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import Loading from '@/components/common/Loading'
import S3Image from '@/components/common/S3Image'
import {
	type AdminConbookFilter,
	type AdminConbookItem,
	useAdminGetConbooks,
	useAdminUnverifyConbook,
	useAdminVerifyConbook,
} from '@/hooks/services/artbook/useUploadFile'
import { useAdminGetUsersByIds } from '@/hooks/services/user/useAdminUser'
import type { PaginationMeta } from '@/types/api/ticket/ticket'
import Button from '@/components/ui/Button'
import { createPortal } from 'react-dom'
import { getS3ProxyUrl, isS3Url } from '@/utils/s3'

type ViewMode = 'pending' | 'verified' | 'all'
type SortMode = 'newest' | 'oldest' | 'pending-first' | 'verified-first'

const createTWithFallback = (t: (key: string) => string) => {
	return (key: string, fallback: string) => {
		const translation = t(key)
		return translation && translation !== key ? translation : fallback
	}
}

const isImageUrl = (url: string) => {
	const cleanUrl = url.split('?')[0].toLowerCase()
	return ['.jpg', '.jpeg', '.png'].some(ext => cleanUrl.endsWith(ext))
}

const getFileNameFromUrl = (url: string, fallback: string) => {
	try {
		const parsed = new URL(url)
		return decodeURIComponent(parsed.pathname.split('/').pop() || fallback)
	} catch {
		return fallback
	}
}

const getDocumentPreviewUrl = (url: string) => {
	if (isS3Url(url)) {
		return getS3ProxyUrl(url)
	}
	return url
}

const formatDateTime = (dateString: string | undefined, locale: string) => {
	if (!dateString) return '–'
	const date = new Date(dateString)
	if (Number.isNaN(date.getTime())) return '–'
	return `${date.toLocaleDateString(locale)} ${date.toLocaleTimeString(locale, {
		hour: '2-digit',
		minute: '2-digit',
	})}`
}

const getSubmitterId = (item: AdminConbookItem) => {
	const fromNested = item.user as
		| (NonNullable<AdminConbookItem['user']> & Record<string, unknown>)
		| undefined

	if (typeof item.user_id === 'string' && item.user_id.trim().length > 0) {
		return item.user_id
	}
	if (typeof fromNested?.id === 'string' && fromNested.id.trim().length > 0) {
		return fromNested.id
	}
	return undefined
}

const getSubmitterLabel = (
	item: AdminConbookItem,
	usersById: Record<
		string,
		{
			fursona_name?: string
			first_name?: string
			last_name?: string
			email?: string
		}
	>
) => {
	const fromNested = item.user as
		| (NonNullable<AdminConbookItem['user']> & Record<string, unknown>)
		| undefined
	const fromTop = item as AdminConbookItem & Record<string, unknown>
	const submitterId = getSubmitterId(item)
	const adminUser = submitterId ? usersById[submitterId] : undefined
	const adminDisplayName =
		adminUser && `${adminUser.first_name || ''} ${adminUser.last_name || ''}`.trim()

	const nameCandidates = [
		adminUser?.fursona_name,
		adminDisplayName,
		adminUser?.email,
		item.fursona_name,
		typeof fromTop.fursonaName === 'string' ? fromTop.fursonaName : undefined,
		fromNested?.fursona_name,
		typeof fromNested?.fursonaName === 'string'
			? fromNested.fursonaName
			: undefined,
	]

	const name = nameCandidates.find(
		candidate => typeof candidate === 'string' && candidate.trim().length > 0
	)
	if (name) return name
	return '–'
}

const ArtSubmitAdminPage = (): React.ReactElement => {
	const tRaw = useTranslations('admin')
	const t = createTWithFallback(tRaw)
	const tCommon = useTranslations('common')
	const locale = useLocale()
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
            setIsClient(true)
        }, [])

	const [searchInput, setSearchInput] = useState('')
	const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null)
	const [viewMode, setViewMode] = useState<ViewMode>('pending')
	const [sortMode, setSortMode] = useState<SortMode>('newest')
	const [filter, setFilter] = useState<AdminConbookFilter>({
		page: 1,
		page_size: 20,
		status: 'pending',
	})

	const pendingFilter: AdminConbookFilter = {
		...filter,
		status: 'pending',
		page: viewMode === 'all' ? 1 : filter.page,
		page_size: viewMode === 'all' ? 200 : filter.page_size,
	}
	const verifiedFilter: AdminConbookFilter = {
		...filter,
		status: 'verified',
		page: viewMode === 'all' ? 1 : filter.page,
		page_size: viewMode === 'all' ? 200 : filter.page_size,
	}

	const {
		data: pendingData,
		isLoading: isPendingLoading,
		isError: isPendingError,
		refetch: refetchPending,
	} = useAdminGetConbooks(pendingFilter)
	const {
		data: verifiedData,
		isLoading: isVerifiedLoading,
		isError: isVerifiedError,
		refetch: refetchVerified,
	} = useAdminGetConbooks(verifiedFilter)
	const verifyMutation = useAdminVerifyConbook()
	const unverifyMutation = useAdminUnverifyConbook()

	const sortSubmissions = (items: AdminConbookItem[]) => {
		const getDate = (item: AdminConbookItem) =>
			new Date(item.created_at || item.createdAt || 0).getTime()

		return [...items].sort((a, b) => {
			if (sortMode === 'newest') return getDate(b) - getDate(a)
			if (sortMode === 'oldest') return getDate(a) - getDate(b)
			if (sortMode === 'pending-first') {
				const statusDiff = Number(Boolean(a.is_verified)) - Number(Boolean(b.is_verified))
				if (statusDiff !== 0) return statusDiff
				return getDate(b) - getDate(a)
			}
			const statusDiff = Number(Boolean(b.is_verified)) - Number(Boolean(a.is_verified))
			if (statusDiff !== 0) return statusDiff
			return getDate(b) - getDate(a)
		})
	}

	const submissions = useMemo(() => {
		if (viewMode === 'pending') return pendingData?.data || []
		if (viewMode === 'verified') return verifiedData?.data || []

		const combined = [...(pendingData?.data || []), ...(verifiedData?.data || [])]
		const deduped = Array.from(new Map(combined.map(item => [item.id, item])).values())
		return sortSubmissions(deduped)
	}, [viewMode, pendingData?.data, verifiedData?.data, sortMode])

	const pagination = useMemo(() => {
		if (viewMode === 'pending') return pendingData?.meta as PaginationMeta | undefined
		if (viewMode === 'verified') return verifiedData?.meta as PaginationMeta | undefined
		return undefined
	}, [viewMode, pendingData?.meta, verifiedData?.meta])

	const submitterIds = useMemo(() => {
		return Array.from(
			new Set(
				submissions
					.map(item => getSubmitterId(item))
					.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
			)
		)
	}, [submissions])

	const { usersById } = useAdminGetUsersByIds(submitterIds)

	const isLoading = viewMode === 'all'
		? isPendingLoading || isVerifiedLoading
		: viewMode === 'pending'
			? isPendingLoading
			: isVerifiedLoading

	const isError = viewMode === 'all'
		? isPendingError || isVerifiedError
		: viewMode === 'pending'
			? isPendingError
			: isVerifiedError

	const stats = useMemo(() => {
		const pending = submissions.filter(item => !item.is_verified).length
		const verified = submissions.filter(item => item.is_verified).length
		return {
			total: pagination?.totalItems || submissions.length,
			pending,
			verified,
		}
	}, [submissions, pagination])

	const isPendingView = viewMode === 'pending'
	const isVerifiedView = viewMode === 'verified'
	const isAllView = viewMode === 'all'

	const filteredSubmissions = useMemo(() => {
		if (!searchInput.trim()) return submissions
		const q = searchInput.toLowerCase().trim()
		return submissions.filter(item => {
			const fileName = item.image_url
				? getFileNameFromUrl(item.image_url, 'Document')
				: ''
			return (
				item.title?.toLowerCase().includes(q) ||
				item.description?.toLowerCase().includes(q) ||
				item.handle?.toLowerCase().includes(q) ||
				getSubmitterLabel(item, usersById).toLowerCase().includes(q) ||
				fileName.toLowerCase().includes(q)
			)
		})
	}, [submissions, searchInput, usersById])

	const handlePageChange = (page: number) => {
		setFilter(prev => ({ ...prev, page }))
	}

	const handleStatusChange = (status: 'pending' | 'verified') => {
		setViewMode(status)
		setFilter(prev => ({ ...prev, page: 1, status }))
	}

	const handleViewAll = () => {
		setViewMode('all')
		setFilter(prev => ({ ...prev, page: 1 }))
	}

	const handleVerify = async (item: AdminConbookItem) => {
		try {
			await verifyMutation.mutateAsync(item.id)
			toast.success(t('submissionApproveSuccess', 'Submission approved successfully'))
		} catch {
			toast.error(t('submissionApproveError', 'Failed to approve submission'))
		}
	}

	const handleUnverify = async (item: AdminConbookItem) => {
		try {
			await unverifyMutation.mutateAsync(item.id)
			toast.success(t('submissionUnverifySuccess', 'Submission moved back to pending'))
		} catch {
			toast.error(t('submissionUnverifyError', 'Failed to unverify submission'))
		}
	}

	return (
		<div className='w-full'>
			<div className='pb-6 border-b border-[#48715B]/15'>
				<h1 className='text-2xl font-bold text-text-primary josefin flex items-center gap-2'>
					{/* <ShieldCheck className='w-6 h-6' /> */}
					{t('artSubmitManagement', 'Art Submit Verification')}
				</h1>
				<p className='text-text-secondary mt-1'>
					{t(
						'artSubmitManagementDesc',
						'Review pending submissions, inspect full details, and approve submitted art.'
					)}
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6'>
				<div className='rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15 p-4'>
					<p className='text-sm font-medium text-[#48715B]'>
						{t('totalSubmissions', 'Total submissions')}
					</p>
					<p className='text-2xl font-bold text-text-primary'>{stats.total}</p>
				</div>
				<div className='rounded-xl bg-amber-50/80 border border-amber-200 p-4'>
					<p className='text-sm font-medium text-amber-700'>
						{t('pendingSubmissions', 'Pending')}
					</p>
					<p className='text-2xl font-bold text-amber-800'>{stats.pending}</p>
				</div>
				<div className='rounded-xl bg-emerald-50/80 border border-emerald-200 p-4'>
					<p className='text-sm font-medium text-emerald-700'>
						{t('approvedSubmissions', 'Approved')}
					</p>
					<p className='text-2xl font-bold text-emerald-800'>{stats.verified}</p>
				</div>
			</div>

			<div className='mt-6 rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15 p-4'>
				<div className='flex flex-wrap gap-4 items-center'>
					<div className='inline-flex rounded-xl border border-[#8C8C8C]/20 overflow-hidden bg-white'>
						<button
							type='button'
							onClick={() => handleStatusChange('pending')}
							className={`px-3 py-2 text-sm font-medium transition-colors ${
								isPendingView
									? 'bg-[#48715B] text-white'
									: 'text-[#48715B] hover:bg-[#e9f2ec]'
							}`}
						>
							{/* <Filter className='w-4 h-4 inline mr-1' /> */}
							{t('pendingOnly', 'Pending Only')}
						</button>
						<button
							type='button'
							onClick={() => handleStatusChange('verified')}
							className={`px-3 py-2 text-sm font-medium transition-colors ${
								isVerifiedView
									? 'bg-[#48715B] text-white'
									: 'text-[#48715B] hover:bg-[#e9f2ec]'
							}`}
						>
							{t('verifiedOnly', 'Verified Only')}
						</button>
						<button
							type='button'
							onClick={handleViewAll}
							className={`px-3 py-2 text-sm font-medium transition-colors ${
								isAllView
									? 'bg-[#48715B] text-white'
									: 'text-[#48715B] hover:bg-[#e9f2ec]'
							}`}
						>
							{t('viewAll', 'View All')}
						</button>
					</div>

					{isAllView && (
						<select
							value={sortMode}
							onChange={event => setSortMode(event.target.value as SortMode)}
							className='rounded-xl bg-white border border-[#8C8C8C]/15 px-3 py-2.5 text-text-secondary focus:outline-none focus:border-[#48715B] transition-colors'
						>
							<option value='newest'>{t('sortNewest', 'Newest')}</option>
							<option value='oldest'>{t('sortOldest', 'Oldest')}</option>
							<option value='pending-first'>{t('sortPendingFirst', 'Pending first')}</option>
							<option value='verified-first'>{t('sortApprovedFirst', 'Approved first')}</option>
						</select>
					)}

					<div className='flex-1 min-w-[220px]'>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8C8C8C]' />
							<input
								type='text'
								value={searchInput}
								onChange={event => setSearchInput(event.target.value)}
								placeholder={t('searchArtSubmit', 'Search by title, handle, submitter...')}
								className='w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#8C8C8C]/15 text-text-secondary placeholder-[#8C8C8C]/40 focus:outline-none focus:border-[#48715B] transition-colors'
							/>
						</div>
					</div>

					<button
						type='button'
						onClick={() => {
							if (isAllView) {
								refetchPending()
								refetchVerified()
								return
							}
							if (isPendingView) {
								refetchPending()
								return
							}
							refetchVerified()
						}}
						className='p-2.5 rounded-xl bg-white border border-[#8C8C8C]/15 hover:bg-[#E2EEE2] transition-colors'
						title={t('refresh', 'Refresh')}
					>
						<RefreshCw className='w-4 h-4 text-[#48715B]' />
					</button>
				</div>
			</div>

			<div className='mt-6'>
				{isLoading ? (
					<div className='p-8 rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15'>
						<Loading />
					</div>
				) : isError ? (
					<div className='p-8 text-center rounded-xl bg-rose-50 border border-rose-200 text-rose-700'>
						<AlertCircle className='w-5 h-5 inline mr-2' />
						{t('unableToLoadArtSubmissions', 'Unable to load art submissions')}
					</div>
				) : filteredSubmissions.length === 0 ? (
					<div className='p-8 text-center rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15 text-text-secondary'>
						{t('noArtSubmissionsFound', 'No submissions found')}
					</div>
				) : (
					<>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                            {/* <Image
                                                        src='/assets/common/drum_pattern.webp'
                                                        alt=''
                                                        fill
                                                        className='absolute inset-0 z-0 opacity-[3%] object-cover pointer-events-none'
                                                        draggable={false}
                                                    /> */}
							{filteredSubmissions.map(item => (
								<div
									key={item.id}
									className='flex h-full flex-col rounded-2xl border border-[#48715B]/15 bg-white/80 p-4 shadow-[0_14px_28px_-20px_rgba(42,74,59,0.8)]'
								>
									<div className='flex items-start justify-between gap-3'>
										<div>
											<h3 className='text-lg font-bold text-text-primary break-words'>
												{item.title || '–'}
											</h3>
											{/* <p className='text-xs text-[#48715B] mt-1 break-all'>
												ID: {item.id}
											</p> */}
										</div>
										<span
											className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
												item.is_verified
													? 'bg-emerald-100 text-emerald-700'
													: 'bg-amber-100 text-amber-700'
											}`}
										>
											{item.is_verified ? (
												<CheckCircle className='w-4 h-4' />
											) : (
												<AlertCircle className='w-4 h-4' />
											)}
											{item.is_verified
												? t('approved', 'Approved')
												: t('pendingApproval', 'Pending approval')}
										</span>
									</div>

									<div className='mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3'>
										<div className='rounded-xl bg-[#f6fbf8] border border-[#48715B]/10 p-3'>
											<p className='text-[11px] uppercase tracking-wide text-[#48715B]/80'>
												{t('handle', 'Social Handle')}
											</p>
											<p className='text-sm text-text-primary break-words'>
												{item.handle || '–'}
											</p>
										</div>
										<div className='rounded-xl bg-[#f6fbf8] border border-[#48715B]/10 p-3'>
											<p className='text-[11px] uppercase tracking-wide text-[#48715B]/80'>
												{t('submitterName', 'Submitter name')}
											</p>
											<p className='text-sm text-text-primary break-words'>
												{getSubmitterLabel(item, usersById)}
											</p>
										</div>
										<div className='rounded-xl bg-[#f6fbf8] border border-[#48715B]/10 p-3 sm:col-span-2'>
											<p className='text-[11px] uppercase tracking-wide text-[#48715B]/80'>
												{t('description', 'Description')}
											</p>
											<p className='text-sm text-text-primary break-words whitespace-pre-wrap'>
												{item.description || '–'}
											</p>
										</div>
										
									</div>

									<div className='mt-auto'>
                                        <div className='rounded-xl bg-[#f6fbf8] border border-[#48715B]/10 p-3 sm:col-span-2'>
											<p className='text-[11px] uppercase tracking-wide text-[#48715B]/80'>
												{t('submittedAt', 'Submitted at')}
											</p>
											<p className='text-sm text-text-primary'>
												{formatDateTime(item.created_at || item.createdAt, locale)}
											</p>
										</div>
										<div className='mt-4'>
											{item.image_url ? (
												isImageUrl(item.image_url) ? (
													<div
														className='group/preview relative h-56 w-full cursor-zoom-in overflow-hidden rounded-xl border border-[#48715B]/20 bg-[#edf5ef]'
														onClick={() => setZoomedImageUrl(item.image_url as string)}
													>
														<S3Image
															src={item.image_url}
															alt={item.title || 'preview'}
															fill
															className='z-0 object-cover'
														/>
														<div className='pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center transition-all duration-200 bg-black/0 opacity-0 group-hover/preview:bg-black/40 group-hover/preview:opacity-100'>
															<Camera className='text-white drop-shadow' size={26} />
															<span className='mt-1 text-xs font-semibold text-white/95'>
																{t('clickToZoom', 'Click to zoom')}
															</span>
														</div>
													</div>
												) : (
													<a
														href={getDocumentPreviewUrl(item.image_url)}
														target='_blank'
														rel='noreferrer'
														className='flex h-56 w-full flex-col items-center justify-center gap-2 rounded-xl border border-[#48715B]/20 bg-[#f6fbf8] p-4 text-center hover:bg-[#edf5ef] transition-colors'
													>
														<FileText className='w-10 h-10 text-[#48715B]' />
														<p className='text-xs text-[#48715B] break-all'>
															{getFileNameFromUrl(item.image_url, 'Document')}
														</p>
														<p className='text-[11px] text-[#48715B]/80'>
															{t('clickToOpenDocument', 'Click to open document')}
														</p>
													</a>
												)
											) : (
												<div className='flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-[#48715B]/25 text-sm text-[#48715B]/80 bg-[#f6fbf8]'>
													{t('noAttachment', 'No attachment')}
												</div>
											)}
										</div>

										<div className='pt-4 flex justify-end'>
											<Button
												className='cursor-pointer'
												props={{
													type: 'button',
													onClick: () =>
														item.is_verified ? handleUnverify(item) : handleVerify(item),
													disabled:
														verifyMutation.isPending || unverifyMutation.isPending,
												}}
											>
												{item.is_verified
													? t('unverify', 'Unverify')
													: t('approve', 'Approve')}
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>

						{!isAllView && pagination && pagination.totalPages > 1 && (
							<div className='mt-4 px-4 py-3 rounded-xl bg-[#E2EEE2]/40 border border-[#8C8C8C]/15 flex items-center justify-between'>
								<p className='text-sm text-text-secondary'>
									{tCommon('page')} {pagination.currentPage} / {pagination.totalPages}
								</p>
								<div className='flex gap-2'>
									<button
										type='button'
										onClick={() => handlePageChange(pagination.currentPage - 1)}
										disabled={pagination.currentPage <= 1}
										className='p-2 rounded-xl border border-[#8C8C8C]/15 hover:bg-[#E2EEE2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
									>
										<ChevronLeft className='w-4 h-4 text-[#48715B]' />
									</button>
									<button
										type='button'
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

			{isClient 
            && zoomedImageUrl &&
                createPortal(
				<div
					className='fixed inset-0 z-[1000] bg-black/85 backdrop-blur-[2px] flex items-center justify-center cursor-zoom-out'
					onClick={() => setZoomedImageUrl(null)}
				>
					<div className='relative w-full h-full max-w-[1200px] max-h-[1200px]'>
						<S3Image
							src={zoomedImageUrl}
							alt='Zoomed preview'
							fill
							className='z-0 object-cover'
						/>
                        </div>
					</div>,
                    document.body
			)}
		</div>
	)
}

export default ArtSubmitAdminPage

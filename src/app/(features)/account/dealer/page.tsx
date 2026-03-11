'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGetMyDealer } from '@/hooks/services/dealer/useDealer'
import { useAuthStore } from '@/stores/authStore'
import { Store, CheckCircle, XCircle, UserCheck, Users, Camera } from 'lucide-react'
import S3Image from '@/components/common/S3Image'
import Loading from '@/components/common/Loading'
import { createPortal } from 'react-dom'
import type { DealerStaff } from '@/types/models/dealer/dealer'

const DealerPage = () => {
	const t = useTranslations('dealer')
	const account = useAuthStore(state => state.account)
	const isDealer = account?.is_dealer || false
	const { data: myDealerData, isLoading: isLoadingDealer } =
		useGetMyDealer(isDealer)

	const myDealer = myDealerData?.data
	const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null)
	const [isClient, setIsClient] = useState(false)

	useEffect(() => {
		setIsClient(true)
	}, [])

	const isImageUrl = (url: string) => {
		const cleanUrl = url.split('?')[0].toLowerCase()
		return ['.jpg', '.jpeg', '.png'].some(ext => cleanUrl.endsWith(ext))
	}

	const priceSheets = (myDealer?.price_sheets && myDealer.price_sheets.length > 0)
		? myDealer.price_sheets
		: myDealer?.price_sheet
		? [myDealer.price_sheet]
		: []

	// If user is not a dealer, show message immediately
	if (!isDealer) {
		return (
			<div className='rounded-2xl sm:rounded-[30px] p-4 sm:p-6 md:p-8 shadow-sm text-text-secondary max-w-full overflow-hidden'>
				<div className='flex flex-col sm:flex-row items-center gap-3 mb-6 sm:mb-8'>
					<Store className='w-7 h-7 sm:w-8 sm:h-8 text-[#48715B] shrink-0' />
					<h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-center'>{t('title')}</h1>
				</div>
				<div className='text-center py-8 sm:py-12'>
					<p className='text-base sm:text-lg text-[#48715B] mb-3 sm:mb-4'>{t('noBooth')}</p>
					<p className='text-sm text-gray-600 dark:text-gray-400 px-1'>
						{t('noBoothHint')}
					</p>
				</div>
			</div>
		)
	}

	// Show loading while fetching dealer data
	if (isLoadingDealer) {
		return (
			<div className='rounded-2xl sm:rounded-[30px] bg-[#E9F5E7] p-4 sm:p-6 md:p-8 shadow-sm text-text-secondary'>
				<Loading />
			</div>
		)
	}

	// If user doesn't have a booth, show message
	if (!myDealer) {
		return (
			<div className='rounded-2xl sm:rounded-[30px] bg-[#E9F5E7] p-4 sm:p-6 md:p-8 shadow-sm text-text-secondary max-w-full overflow-hidden'>
				<div className='flex flex-col sm:flex-row items-center gap-3 mb-6 sm:mb-8'>
					<Store className='w-7 h-7 sm:w-8 sm:h-8 text-[#48715B] shrink-0' />
					<h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-center'>{t('title')}</h1>
				</div>
				<div className='text-center py-8 sm:py-12'>
					<p className='text-base sm:text-lg text-[#48715B] mb-3 sm:mb-4'>{t('noBooth')}</p>
					<p className='text-sm text-gray-600 dark:text-gray-400 px-1'>
						{t('noBoothHint')}
					</p>
				</div>
			</div>
		)
	}

	const staffs = myDealer.staffs || []
	const isOwner =
		staffs.some(
			(staff: DealerStaff) => staff.user_id === account?.id && staff.is_owner
		) || false
	const currentUserStaff = staffs.find(
		(staff: DealerStaff) => staff.user_id === account?.id
	)

	return (
		<div className='rounded-2xl sm:rounded-[30px] bg-[#E9F5E7] p-4 sm:p-6 md:p-8 shadow-sm text-text-secondary max-w-full overflow-hidden'>
			{isClient &&
				zoomedImageUrl &&
				createPortal(
					<div
						className='fixed inset-0 z-[1000] bg-black/85 backdrop-blur-[2px] flex items-center justify-center cursor-zoom-out'
						onClick={() => setZoomedImageUrl(null)}
					>
						<div className='relative w-full h-full max-w-[1200px] max-h-[1200px]'>
							<S3Image
								src={zoomedImageUrl}
								alt={t('priceSheetAlt')}
								fill
								className='object-contain'
							/>
						</div>
					</div>,
					document.body
				)}
			<div className='flex flex-col sm:flex-row items-center gap-3 mb-6 sm:mb-8'>
				<Store className='w-7 h-7 sm:w-8 sm:h-8 text-[#48715B] shrink-0' />
				<h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-center'>{t('myBoothTitle')}</h1>
			</div>

			<div className='space-y-4 sm:space-y-6'>
				{/* Booth Information Card */}
				<div className='p-4 sm:p-6 rounded-lg'>
					<div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4'>
						<div className='min-w-0'>
							<h2 className='text-xl sm:text-2xl font-bold text-[#48715B] mb-2 break-words'>
								{myDealer.booth_name}
							</h2>
							<div className='flex flex-wrap items-center gap-2 mt-2'>
								{isOwner && (
									<span className='inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-green-200 text-green-700 text-xs sm:text-sm font-medium'>
										<UserCheck className='w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0' />
										{t('ownerBadge')}
									</span>
								)}
								{!isOwner && currentUserStaff && (
									<span className='inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs sm:text-sm font-medium'>
										<Users className='w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0' />
										{t('staffBadge')}
									</span>
								)}
							</div>
						</div>
						<div className='flex flex-wrap items-center gap-2 shrink-0'>
							{myDealer.is_verified ? (
								<span className='inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs sm:text-sm font-medium'>
									<CheckCircle className='w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0' />
									{t('verified')}
								</span>
							) : (
								<span className='inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs sm:text-sm font-medium'>
									<XCircle className='w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0' />
									{t('unverified')}
								</span>
							)}
						</div>
					</div>

					{/* Booth Code */}
					<div className='mb-4'>
						<label className='block text-sm font-medium text-[#48715B] mb-2'>
							{t('boothCode')}
						</label>
						<div className='px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg'>
							<code className='text-base sm:text-lg font-mono font-bold text-[#48715B] break-all'>
								{myDealer.booth_number}
							</code>
						</div>
					</div>

					{/* Description */}
					<div className='mb-4'>
						<label className='block text-sm font-medium text-[#48715B] mb-2'>
							{t('description')}
						</label>
						<p className='text-sm sm:text-base text-gray-700 dark:text-gray-300 break-words'>
							{myDealer.description}
						</p>
					</div>

					{/* Price Sheets */}
					{priceSheets.length > 0 && (
						<div className='mb-4'>
							<label className='block text-sm font-medium text-[#48715B] mb-3'>
								{t('priceSheetLabel')}
							</label>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
								{priceSheets.map((url: string, index: number) => (
									<div key={`${url}-${index}`}>
										{priceSheets.length > 1 && (
											<p className='text-xs font-medium text-[#48715B] mb-2'>
												{t('priceSheetN', { n: index + 1 })}
											</p>
										)}
										{isImageUrl(url) ? (
											<div
												className='group/preview relative h-48 w-full cursor-zoom-in overflow-hidden rounded-lg border border-[#48715B]/20 bg-white shadow-md'
												onClick={() => setZoomedImageUrl(url)}
											>
												<S3Image
													src={url}
													alt={t('priceSheetAlt')}
													fill
													className='z-0 object-cover'
												/>
												<div className='pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center transition-all duration-200 bg-black/0 opacity-0 group-hover/preview:bg-black/40 group-hover/preview:opacity-100'>
													<Camera className='text-white drop-shadow' size={28} />
													<span className='mt-2 text-xs font-semibold text-white/95'>
														{t('clickToZoom')}
													</span>
												</div>
											</div>
										) : (
											<div className='h-48 w-full rounded-lg border border-[#48715B]/20 bg-gray-100 flex items-center justify-center'>
												<p className='text-sm text-gray-500'>{t('priceSheetAlt')}</p>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Staff Members */}
					{staffs.length > 0 && (
						<div>
							<label className='block text-sm font-medium text-[#48715B] mb-2'>
								{t('membersCount', { count: staffs.length })}
							</label>
							<div className='space-y-2'>
								{staffs.map((staff: DealerStaff) => (
									<div
										key={staff.id}
										className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border-t border-gray-200 dark:border-gray-700 first:border-t-0'
									>
										<div className='flex items-center gap-3 min-w-0'>
											<div className='w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#48715B] flex items-center justify-center text-white text-sm font-semibold shrink-0'>
												{staff.user_name?.charAt(0).toUpperCase() || 'U'}
											</div>
											<div className='min-w-0'>
												<p className='font-medium truncate'>{staff.user_name}</p>
												<p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate' title={staff.user_email}>
													{staff.user_email}
												</p>
											</div>
										</div>
										{staff.is_owner && (
											<span className='px-2 py-1 rounded text-xs font-medium bg-green-200 text-green-700 w-fit'>
												{t('ownerShort')}
											</span>
										)}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default DealerPage

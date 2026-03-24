'use client'

import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useTranslations } from 'next-intl'
import {
	useGetMyDealer,
	useEditDealer,
	useRemoveStaff,
	useLeaveDealer,
} from '@/hooks/services/dealer/useDealer'
import { useAuthStore } from '@/stores/authStore'
import {
	Store,
	CheckCircle,
	XCircle,
	UserCheck,
	Users,
	Camera,
	Plus,
	Trash2,
	Pencil,
} from 'lucide-react'
import S3Image from '@/components/common/S3Image'
import Loading from '@/components/common/Loading'
import { createPortal } from 'react-dom'
import type { DealerStaff } from '@/types/models/dealer/dealer'
import ImageUploader from '@/components/common/ImageUploader'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const MAX_PRICE_SHEETS = 5

type PriceSheetSlot = { id: number; url: string }
type DealerEditFormData = {
	booth_name: string
	description: string
}
type ConfirmAction =
	| { type: 'kick'; staffUserId: string; staffName: string }
	| { type: 'leave' }

const DealerPage = () => {
	const t = useTranslations('dealer')
	const tCommon = useTranslations('common')
	const account = useAuthStore(state => state.account)
	const isDealer = account?.is_dealer || false
	const { data: myDealerData, isLoading: isLoadingDealer } =
		useGetMyDealer(isDealer)
	const editDealerMutation = useEditDealer()
	const removeStaffMutation = useRemoveStaff()
	const leaveDealerMutation = useLeaveDealer()

	const myDealer = myDealerData?.data
	const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null)
	const [isClient, setIsClient] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const [slots, setSlots] = useState<PriceSheetSlot[]>([{ id: 0, url: '' }])
	const [priceSheetError, setPriceSheetError] = useState<string | null>(null)
	const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
	const nextSlotId = useRef(1)

	const DealerEditSchema = useMemo(
		() =>
			z.object({
				booth_name: z
					.string()
					.min(1, t('validation.boothNameRequired'))
					.min(2, t('validation.boothNameMin'))
					.max(255, t('validation.boothNameMax')),
				description: z
					.string()
					.min(1, t('validation.descriptionRequired'))
					.min(10, t('validation.descriptionMin'))
					.max(500, t('validation.descriptionMax')),
			}),
		[t]
	)

	const {
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors },
	} = useForm<DealerEditFormData>({
		resolver: zodResolver(DealerEditSchema),
		defaultValues: {
			booth_name: '',
			description: '',
		},
	})

	const descriptionValue = watch('description')

	useEffect(() => {
		setIsClient(true)
	}, [])

	useEffect(() => {
		if (!myDealer) return

		const initialPriceSheets: string[] =
			myDealer.price_sheets && myDealer.price_sheets.length > 0
				? myDealer.price_sheets
				: myDealer.price_sheet
				? [myDealer.price_sheet]
				: []

		reset({
			booth_name: myDealer.booth_name || '',
			description: myDealer.description || '',
		})

		if (initialPriceSheets.length > 0) {
			setSlots(
				initialPriceSheets.map((url: string, index: number) => ({
					id: index,
					url,
				}))
			)
			nextSlotId.current = initialPriceSheets.length
		} else {
			setSlots([{ id: 0, url: '' }])
			nextSlotId.current = 1
		}

		setPriceSheetError(null)
	}, [myDealer, reset])

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

	const handlePriceSheetUploadSuccess = (slotId: number, fileUrl: string) => {
		setSlots(prev =>
			prev.map(slot => (slot.id === slotId ? { ...slot, url: fileUrl } : slot))
		)
		setPriceSheetError(null)
		toast.success(t('uploadPriceSheetSuccess'))
	}

	const handlePriceSheetUploadError = (error: Error) => {
		toast.error(t('uploadPriceSheetError', { message: error.message }))
	}

	const handlePriceSheetRemove = (slotId: number) => {
		setZoomedImageUrl(current => {
			const slot = slots.find(s => s.id === slotId)
			return current === slot?.url ? null : current
		})
		setSlots(prev =>
			prev.map(slot => (slot.id === slotId ? { ...slot, url: '' } : slot))
		)
	}

	const addPriceSheetSlot = () => {
		setSlots(prev => {
			if (prev.length >= MAX_PRICE_SHEETS) return prev
			const id = nextSlotId.current++
			return [...prev, { id, url: '' }]
		})
	}

	const removePriceSheetSlot = (slotId: number) => {
		setZoomedImageUrl(current => {
			const slot = slots.find(s => s.id === slotId)
			return current === slot?.url ? null : current
		})
		setSlots(prev => prev.filter(slot => slot.id !== slotId))
	}

	const onStartEdit = () => {
		setIsEditing(true)
	}

	const onCancelEdit = () => {
		if (!myDealer) return

		const initialPriceSheets: string[] =
			myDealer.price_sheets && myDealer.price_sheets.length > 0
				? myDealer.price_sheets
				: myDealer.price_sheet
				? [myDealer.price_sheet]
				: []

		reset({
			booth_name: myDealer.booth_name || '',
			description: myDealer.description || '',
		})

		if (initialPriceSheets.length > 0) {
			setSlots(
				initialPriceSheets.map((url: string, index: number) => ({
					id: index,
					url,
				}))
			)
			nextSlotId.current = initialPriceSheets.length
		} else {
			setSlots([{ id: 0, url: '' }])
			nextSlotId.current = 1
		}

		setPriceSheetError(null)
		setIsEditing(false)
	}

	const onSubmitEdit = (data: DealerEditFormData) => {
		if (!myDealer?.id) return

		const filledUrls = slots.map(slot => slot.url).filter(Boolean)
		if (filledUrls.length === 0) {
			setPriceSheetError(t('pleaseUploadPriceSheet'))
			return
		}

		editDealerMutation.mutate(
			{
				id: myDealer.id,
				payload: {
					booth_name: data.booth_name,
					description: data.description,
					price_sheets: filledUrls,
				},
			},
			{
				onSuccess: response => {
					if (response.isSuccess) {
						toast.success(t('editSuccess'))
						setIsEditing(false)
						return
					}

					toast.error(response.message || t('editFailed'))
				},
				onError: (error: unknown) => {
					const errorMessage =
						(
							error as {
								response?: { data?: { message?: string } }
							}
						)?.response?.data?.message ||
						(error as { message?: string })?.message ||
						t('editFailedRetry')

					toast.error(errorMessage)
				},
			}
		)
	}

	const handleRemoveStaff = (staffUserId: string) => {
		removeStaffMutation.mutate(
			{ staff_user_id: staffUserId },
			{
				onSuccess: response => {
					if (response.isSuccess) {
						toast.success(t('kickMemberSuccess'))
						return
					}
					toast.error(response.message || t('kickMemberFailed'))
				},
				onError: (error: unknown) => {
					const errorMessage =
						(
							error as {
								response?: { data?: { message?: string } }
							}
						)?.response?.data?.message ||
						(error as { message?: string })?.message ||
						t('kickMemberFailedRetry')
					toast.error(errorMessage)
				},
			}
		)
	}

	const onKickMember = (staff: DealerStaff) => {
		if (staff.is_owner || staff.user_id === account?.id) return
		setConfirmAction({
			type: 'kick',
			staffUserId: staff.user_id,
			staffName: staff.user_name || t('unknownMember'),
		})
	}

	const onLeaveBooth = () => {
		if (!account?.id || isOwner || !currentUserStaff) return
		setConfirmAction({ type: 'leave' })
	}

	const onConfirmAction = () => {
		if (!confirmAction) return
		if (confirmAction.type === 'kick') {
			handleRemoveStaff(confirmAction.staffUserId)
			setConfirmAction(null)
			return
		}

		leaveDealerMutation.mutate(undefined, {
			onSuccess: response => {
				if (response.isSuccess) {
					toast.success(t('leaveSuccess'))
					setConfirmAction(null)
					return
				}
				toast.error(response.message || t('leaveFailed'))
			},
			onError: (error: unknown) => {
				const errorMessage =
					(
						error as {
							response?: { data?: { message?: string } }
						}
					)?.response?.data?.message ||
					(error as { message?: string })?.message ||
					t('leaveFailedRetry')
				toast.error(errorMessage)
			},
		})
	}

	const isConfirmActionPending =
		removeStaffMutation.isPending || leaveDealerMutation.isPending

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
			{isClient &&
				confirmAction &&
				createPortal(
					<div className='fixed inset-0 z-[1001] flex items-center justify-center bg-black/50 p-4'>
						<div className='w-full max-w-md rounded-xl border border-[#8C8C8C]/20 bg-white p-5 shadow-2xl'>
							<h3 className='text-lg font-semibold text-text-primary mb-3'>
								{confirmAction.type === 'kick'
									? t('kickMember')
									: t('leaveBooth')}
							</h3>
							<p className='text-sm text-text-secondary mb-5'>
								{confirmAction.type === 'kick'
									? t('confirmKickMember', { name: confirmAction.staffName })
									: t('confirmLeaveBooth')}
							</p>
							<div className='flex gap-2'>
								<button
									type='button'
									onClick={() => setConfirmAction(null)}
									disabled={isConfirmActionPending}
									className='flex-1 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
								>
									{tCommon('cancel')}
								</button>
								<button
									type='button'
									onClick={onConfirmAction}
									disabled={isConfirmActionPending}
									className='flex-1 inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
								>
									{isConfirmActionPending
										? tCommon('processing')
										: tCommon('confirm')}
								</button>
							</div>
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
					<form onSubmit={handleSubmit(onSubmitEdit)} className='space-y-4'>
						<div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4'>
							<div className='min-w-0 flex-1'>
								{isEditing ? (
									<div>
										<label
											htmlFor='booth_name'
											className='block text-sm font-medium text-[#48715B] mb-2'
										>
											{t('boothNameLabel')} <span className='text-red-500'>*</span>
										</label>
										<input
											id='booth_name'
											type='text'
											{...register('booth_name')}
											className='w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-base text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#48715B] focus:border-transparent min-w-0'
											placeholder={t('boothNamePlaceholder')}
											disabled={editDealerMutation.isPending}
										/>
										{errors.booth_name && (
											<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
												{errors.booth_name.message}
											</p>
										)}
									</div>
								) : (
									<h2 className='text-xl sm:text-2xl font-bold text-[#48715B] mb-2 break-words'>
										{myDealer.booth_name}
									</h2>
								)}
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
								{isOwner && !isEditing && (
									<button
										type='button'
										onClick={onStartEdit}
										className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#48715B] text-white text-xs sm:text-sm font-medium hover:bg-[#3a5a4a] transition-colors'
									>
										<Pencil className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
										{tCommon('edit')}
									</button>
								)}
								{!isOwner && currentUserStaff && (
									<button
										type='button'
										onClick={onLeaveBooth}
										disabled={leaveDealerMutation.isPending}
										className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs sm:text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
									>
										{leaveDealerMutation.isPending
											? t('leaving')
											: t('leaveBooth')}
									</button>
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
							{isEditing ? (
								<div>
									<textarea
										id='description'
										{...register('description')}
										rows={4}
										className='w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-base text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#48715B] focus:border-transparent resize-none min-w-0 min-h-[100px] sm:min-h-0'
										placeholder={t('descriptionPlaceholder')}
										disabled={editDealerMutation.isPending}
									/>
									{errors.description && (
										<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
											{errors.description.message}
										</p>
									)}
									<p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
										{t('descriptionCharCount', {
											count: descriptionValue?.length || 0,
										})}
									</p>
								</div>
							) : (
								<p className='text-sm sm:text-base text-gray-700 dark:text-gray-300 break-words'>
									{myDealer.description}
								</p>
							)}
						</div>

						{/* Price Sheets */}
						<div className='mb-4'>
							<label className='block text-sm font-medium text-[#48715B] mb-3'>
								{t('priceSheetLabel')}
							</label>
							{isEditing ? (
								<div className='space-y-4'>
									{slots.map((slot, index) => (
										<div key={slot.id}>
											{(slots.length > 1 || slot.url) && (
												<div className='flex items-center justify-between mb-2'>
													<span className='text-xs font-medium text-[#48715B]'>
														{t('priceSheetN', { n: index + 1 })}
													</span>
													<button
														type='button'
														onClick={() => {
															if (slots.length > 1) {
																removePriceSheetSlot(slot.id)
																return
															}

															handlePriceSheetRemove(slot.id)
														}}
														disabled={editDealerMutation.isPending}
														className='flex items-center gap-1 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
													>
														<Trash2 className='w-3.5 h-3.5' />
														{t('removePriceSheet')}
													</button>
												</div>
											)}
											<ImageUploader
												onUploadSuccess={fileUrl =>
													handlePriceSheetUploadSuccess(slot.id, fileUrl)
												}
												onUploadError={handlePriceSheetUploadError}
												onRemove={() => handlePriceSheetRemove(slot.id)}
												folder='dealer-price-sheets'
												maxSizeMB={10}
												accept='image/*'
												initialImageUrl={slot.url || undefined}
												showPreview={true}
												buttonText={t('priceSheetButton')}
												label={t('priceSheetUploadLabel')}
												disabled={editDealerMutation.isPending}
											/>
											{slot.url && isImageUrl(slot.url) && (
												<div
													className='group/preview relative mt-3 h-48 w-full cursor-zoom-in overflow-hidden rounded-lg border border-[#48715B]/20 bg-white shadow-md'
													onClick={() => setZoomedImageUrl(slot.url)}
												>
													<S3Image
														src={slot.url}
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
											)}
										</div>
									))}
									{priceSheetError && (
										<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
											{priceSheetError}
										</p>
									)}
									{slots.length < MAX_PRICE_SHEETS && (
										<button
											type='button'
											onClick={addPriceSheetSlot}
											disabled={editDealerMutation.isPending}
											className='cursor-pointer !border-none mt-2 inline-flex items-center gap-1.5 rounded-xl border border-[#48715B]/25 bg-white px-3 py-2 text-sm text-[#3a5a4a] transition-colors hover:!bg-[#48715B] hover:!text-[#f0f8f3] font-bold disabled:opacity-50'
										>
											<Plus className='w-4 h-4' />
											{t('addPriceSheet')}
										</button>
									)}
									<p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
										{t('priceSheetHint')}
									</p>
								</div>
							) : priceSheets.length > 0 ? (
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
							) : (
								<div className='h-48 w-full rounded-lg border border-[#48715B]/20 bg-gray-100 flex items-center justify-center'>
									<p className='text-sm text-gray-500'>{t('priceSheetAlt')}</p>
								</div>
							)}
						</div>

						{isOwner && isEditing && (
							<div className='flex flex-col sm:flex-row gap-2 pt-2'>
								<button
									type='submit'
									disabled={editDealerMutation.isPending}
									className='inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#48715B] text-white text-sm font-medium hover:bg-[#3a5a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
								>
									{editDealerMutation.isPending
										? tCommon('saving')
										: tCommon('save')}
								</button>
								<button
									type='button'
									onClick={onCancelEdit}
									disabled={editDealerMutation.isPending}
									className='inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
								>
									{tCommon('cancel')}
								</button>
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
											{isOwner &&
												!staff.is_owner &&
												staff.user_id !== account?.id && (
													<button
														type='button'
														onClick={() => onKickMember(staff)}
														disabled={removeStaffMutation.isPending}
														className='inline-flex items-center justify-center gap-1 rounded-lg border border-red-300 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
													>
														{t('kickMember')}
													</button>
												)}
										</div>
									))}
								</div>
							</div>
						)}
					</form>
				</div>
			</div>
		</div>
	)
}

export default DealerPage

'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createPortal } from 'react-dom'
import {
	useRegisterDealer,
	useJoinDealer,
} from '@/hooks/services/dealer/useDealer'
import ImageUploader from '@/components/common/ImageUploader'
import S3Image from '@/components/common/S3Image'
// import { getS3ProxyUrl, isS3Url } from '@/utils/s3'
import { Store, Users, Plus, Trash2, Camera } from 'lucide-react'

const MAX_PRICE_SHEETS = 5

type PriceSheetSlot = { id: number; url: string }

type DealerRegisterFormData = {
	booth_name: string
	description: string
}

type JoinDealerFormData = {
	booth_code: string
}

const DealerRegisterPage = () => {
	const t = useTranslations('dealer')
	const tCommon = useTranslations('common')
	const router = useRouter()
	const registerDealerMutation = useRegisterDealer()
	const joinDealerMutation = useJoinDealer()
	const [slots, setSlots] = useState<PriceSheetSlot[]>([{ id: 0, url: '' }])
	const [priceSheetError, setPriceSheetError] = useState<string | null>(null)
	const nextSlotId = useRef(1)
	const [showJoinForm, setShowJoinForm] = useState(false)
	const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null)
	const [isClient, setIsClient] = useState(false)

	const isImageUrl = (url: string) => {
		const cleanUrl = url.split('?')[0].toLowerCase()
		return ['.jpg', '.jpeg', '.png'].some(ext => cleanUrl.endsWith(ext))
	}

	useEffect(() => {
		setIsClient(true)
	}, [])

	const DealerRegisterSchema = useMemo(
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

	const JoinDealerSchema = useMemo(
		() =>
			z.object({
				booth_code: z
					.string()
					.min(1, t('validation.boothCodeRequired'))
					.length(6, t('validation.boothCodeLength')),
			}),
		[t]
	)

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
		setError,
	} = useForm<DealerRegisterFormData>({
		resolver: zodResolver(DealerRegisterSchema),
		defaultValues: {
			booth_name: '',
			description: '',
		},
	})

	const descriptionValue = watch('description')

	const {
		register: registerJoin,
		handleSubmit: handleSubmitJoin,
		formState: { errors: errorsJoin, isSubmitting: isSubmittingJoin },
		reset: resetJoin,
		setError: setErrorJoin,
	} = useForm<JoinDealerFormData>({
		resolver: zodResolver(JoinDealerSchema),
		defaultValues: {
			booth_code: '',
		},
	})

	const handlePriceSheetUploadSuccess = useCallback(
		(slotId: number, fileUrl: string) => {
			setSlots(prev =>
				prev.map(s => (s.id === slotId ? { ...s, url: fileUrl } : s))
			)
			setPriceSheetError(null)
			toast.success(t('uploadPriceSheetSuccess'))
		},
		[t]
	)

	const handlePriceSheetUploadError = useCallback(
		(error: Error) => {
			toast.error(t('uploadPriceSheetError', { message: error.message }))
		},
		[t]
	)

	const handlePriceSheetRemove = useCallback((slotId: number) => {
		setZoomedImageUrl(current => {
			const slot = slots.find(s => s.id === slotId)
			return current === slot?.url ? null : current
		})
		setSlots(prev =>
			prev.map(s => (s.id === slotId ? { ...s, url: '' } : s))
		)
	}, [slots])

	const addPriceSheetSlot = useCallback(() => {
		setSlots(prev => {
			if (prev.length >= MAX_PRICE_SHEETS) return prev
			const id = nextSlotId.current++
			return [...prev, { id, url: '' }]
		})
	}, [])

	const removePriceSheetSlot = useCallback((slotId: number) => {
		setZoomedImageUrl(current => {
			const slot = slots.find(s => s.id === slotId)
			return current === slot?.url ? null : current
		})
		setSlots(prev => prev.filter(s => s.id !== slotId))
	}, [slots])

	const onSubmit = async (data: DealerRegisterFormData) => {
		const filledUrls = slots.map(s => s.url).filter(Boolean)
		if (filledUrls.length === 0) {
			setPriceSheetError(t('pleaseUploadPriceSheet'))
			return
		}

		registerDealerMutation.mutate(
			{
				booth_name: data.booth_name,
				description: data.description,
				price_sheets: filledUrls,
			},
			{
				onSuccess: response => {
					if (response.isSuccess) {
						toast.success(t('registerSuccess'))
						setTimeout(() => {
							router.push('/account')
						}, 1500)
					} else {
						toast.error(response.message || t('registerFailed'))
					}
				},
				onError: (error: unknown) => {
					const errorMessage =
						(
							error as {
								response?: { data?: { message?: string }; status?: number }
							}
						)?.response?.data?.message ||
						(error as { message?: string })?.message ||
						t('registerFailedRetry')
					toast.error(errorMessage)

					const errorStatus = (error as { response?: { status?: number } })
						?.response?.status
					if (errorStatus === 409) {
						setError('root', {
							type: 'manual',
							message: t('alreadyMember'),
						})
					} else if (errorStatus === 403) {
						setError('root', {
							type: 'manual',
							message: t('needApprovedTicket'),
						})
					}
				},
			}
		)
	}

	const onSubmitJoin = async (data: JoinDealerFormData) => {
		joinDealerMutation.mutate(
			{
				booth_code: data.booth_code.toUpperCase().trim(),
			},
			{
				onSuccess: response => {
					if (response.isSuccess) {
						toast.success(t('joinSuccess'))
						resetJoin()
						setShowJoinForm(false)
						setTimeout(() => {
							router.push('/account')
						}, 1500)
					} else {
						toast.error(response.message || t('joinFailed'))
					}
				},
				onError: (error: unknown) => {
					const errorMessage =
						(
							error as {
								response?: { data?: { message?: string }; status?: number }
							}
						)?.response?.data?.message ||
						(error as { message?: string })?.message ||
						t('joinFailedRetry')
					toast.error(errorMessage)

					const errorStatus = (error as { response?: { status?: number } })
						?.response?.status
					if (errorStatus === 404) {
						setErrorJoin('booth_code', {
							type: 'manual',
							message: t('boothNotFound'),
						})
					} else if (errorStatus === 409) {
						setErrorJoin('root', {
							type: 'manual',
							message: t('alreadyMember'),
						})
					} else if (errorStatus === 403) {
						setErrorJoin('root', {
							type: 'manual',
							message: t('needApprovedTicketAndVerified'),
						})
					}
				},
			}
		)
	}

	return (
		<div className='rounded-xl sm:rounded-2xl md:rounded-[30px] p-4 sm:p-6 md:p-8 shadow-sm text-text-secondary'>
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
				<h1 className='text-2xl sm:text-3xl font-bold text-center sm:text-left'>
					{t('registerTitle')}
				</h1>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className='space-y-5 sm:space-y-6'>
				{errors.root && (
					<div
						className='p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
						role='alert'
					>
						{errors.root.message}
					</div>
				)}

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
						disabled={isSubmitting || registerDealerMutation.isPending}
					/>
					{errors.booth_name && (
						<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
							{errors.booth_name.message}
						</p>
					)}
				</div>

				<div>
					<label
						htmlFor='description'
						className='block text-sm font-medium text-[#48715B] mb-2'
					>
						{t('descriptionLabel')} <span className='text-red-500'>*</span>
					</label>
					<textarea
						id='description'
						{...register('description')}
						rows={4}
						className='w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-base text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#48715B] focus:border-transparent resize-none min-w-0 min-h-[100px] sm:min-h-0'
						placeholder={t('descriptionPlaceholder')}
						disabled={isSubmitting || registerDealerMutation.isPending}
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

				<div>
					<label className='block text-sm font-medium text-[#48715B] mb-2'>
						{t('priceSheet', { count: slots.length })} <span className='text-red-500'>*</span>
					</label>
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
											disabled={isSubmitting || registerDealerMutation.isPending}
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
									disabled={isSubmitting || registerDealerMutation.isPending}
								/>							{slot.url && isImageUrl(slot.url) && (
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
					</div>
					{priceSheetError && (
						<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
							{priceSheetError}
						</p>
					)}
					{slots.length < MAX_PRICE_SHEETS && (
						<button
							type='button'
							onClick={addPriceSheetSlot}
							disabled={isSubmitting || registerDealerMutation.isPending}
							className='bg-white mt-3 flex items-center gap-1.5 text-sm font-medium text-[#48715B] hover:text-[#3a5a4a] dark:text-[#7fba9c] dark:hover:text-[#9dd4b4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
						>
							<Plus className='w-4 h-4' />
							{t('addPriceSheet')}
						</button>
					)}
					<p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
						{t('priceSheetHint')}
					</p>
				</div>

				<div className='pt-2 sm:pt-4'>
					<button
						type='submit'
						disabled={isSubmitting || registerDealerMutation.isPending}
						className='w-full py-3 px-4 rounded-lg bg-[#48715B] text-white font-medium text-sm sm:text-base transition-colors duration-200 hover:bg-[#3a5a4a] focus:outline-none focus:ring-2 focus:ring-[#48715B] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md touch-manipulation'
					>
						{isSubmitting || registerDealerMutation.isPending
							? t('submittingRegister')
							: t('submitRegister')}
					</button>
				</div>

				<div className='relative mb-6 sm:mb-8'>
					<div className='absolute inset-0 flex items-center'>
						<div className='w-full border-t border-[#48715B]/30'></div>
					</div>
					<div className='relative flex justify-center text-sm'>
						<span className='px-4 bg-[#E9F5E7] dark:bg-dark-surface text-[#48715B] font-medium'>
							{t('or')}
						</span>
					</div>
				</div>

				{!showJoinForm ? (
					<div className='mb-6 sm:mb-8 p-4 sm:p-6 rounded-lg bg-white dark:bg-dark-surface border border-[#48715B]/30'>
						<div className='flex items-center gap-3 mb-3 sm:mb-4'>
							<Users className='w-5 h-5 sm:w-6 sm:h-6 text-[#48715B] shrink-0' />
							<h2 className='text-lg sm:text-xl font-semibold text-[#48715B]'>
								{t('joinExistingTitle')}
							</h2>
						</div>
						<p className='text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4'>
							{t('joinExistingDesc')}
						</p>
						<button
							type='button'
							onClick={() => setShowJoinForm(true)}
							className='w-full py-2.5 sm:py-2 px-4 rounded-lg bg-[#48715B] text-white font-medium text-sm sm:text-base transition-colors duration-200 hover:bg-[#3a5a4a] focus:outline-none focus:ring-2 focus:ring-[#48715B] focus:ring-offset-2 shadow-md touch-manipulation'
						>
							{t('joinExistingButton')}
						</button>
					</div>
				) : (
					<div className='mb-6 sm:mb-8 p-4 sm:p-6 rounded-lg bg-white dark:bg-dark-surface border border-[#48715B]/30'>
						<div className='flex items-center gap-3 mb-3 sm:mb-4'>
							<Users className='w-5 h-5 sm:w-6 sm:h-6 text-[#48715B] shrink-0' />
							<h2 className='text-lg sm:text-xl font-semibold text-[#48715B]'>
								{t('joinExistingTitle')}
							</h2>
						</div>
						<form
							onSubmit={handleSubmitJoin(onSubmitJoin)}
							className='space-y-4'
						>
							{errorsJoin.root && (
								<div
									className='p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm'
									role='alert'
								>
									{errorsJoin.root.message}
								</div>
							)}

							<div>
								<label
									htmlFor='booth_code'
									className='block text-sm font-medium text-[#48715B] mb-2'
								>
									{t('boothCode')} <span className='text-red-500'>*</span>
								</label>
								<input
									id='booth_code'
									type='text'
									{...registerJoin('booth_code')}
									className='w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-base text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#48715B] focus:border-transparent uppercase min-w-0'
									placeholder={t('boothCodePlaceholder')}
									disabled={isSubmittingJoin || joinDealerMutation.isPending}
									maxLength={6}
									style={{ textTransform: 'uppercase' }}
								/>
								{errorsJoin.booth_code && (
									<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
										{errorsJoin.booth_code.message}
									</p>
								)}
								<p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
									{t('boothCodeHint')}
								</p>
							</div>

							<div className='flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2'>
								<button
									type='submit'
									disabled={isSubmittingJoin || joinDealerMutation.isPending}
									className='flex-1 py-2.5 sm:py-2 px-4 rounded-lg bg-[#48715B] text-white font-medium text-sm sm:text-base transition-colors duration-200 hover:bg-[#3a5a4a] focus:outline-none focus:ring-2 focus:ring-[#48715B] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md touch-manipulation'
								>
									{isSubmittingJoin || joinDealerMutation.isPending
										? t('joining')
										: t('joinButton')}
								</button>
								<button
									type='button'
									onClick={() => {
										setShowJoinForm(false)
										resetJoin()
									}}
									disabled={isSubmittingJoin || joinDealerMutation.isPending}
									className='flex-1 py-2.5 sm:py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium text-sm sm:text-base transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md touch-manipulation'
								>
									{tCommon('cancel')}
								</button>
							</div>
						</form>
					</div>
				)}

				<div className='mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'>
					<p className='text-sm text-blue-700 dark:text-blue-400'>
						{t('noteText')}
					</p>
				</div>
			</form>
		</div>
	)
}

export default DealerRegisterPage

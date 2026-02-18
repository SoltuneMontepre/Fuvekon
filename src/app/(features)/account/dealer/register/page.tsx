'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
	useRegisterDealer,
	useJoinDealer,
} from '@/hooks/services/dealer/useDealer'
import ImageUploader from '@/components/common/ImageUploader'
import { Store, Users } from 'lucide-react'

type DealerRegisterFormData = {
	booth_name: string
	description: string
	price_sheet: string
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
	const [priceSheetUrl, setPriceSheetUrl] = useState<string>('')
	const [showJoinForm, setShowJoinForm] = useState(false)

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
				price_sheet: z
					.string()
					.url(t('validation.priceSheetUrlInvalid'))
					.min(1, t('validation.priceSheetRequired')),
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
		setValue,
		setError,
		clearErrors,
	} = useForm<DealerRegisterFormData>({
		resolver: zodResolver(DealerRegisterSchema),
		defaultValues: {
			booth_name: '',
			description: '',
			price_sheet: '',
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
		(fileUrl: string) => {
			setPriceSheetUrl(fileUrl)
			setValue('price_sheet', fileUrl)
			clearErrors('price_sheet')
			toast.success(t('uploadPriceSheetSuccess'))
		},
		[setValue, clearErrors, t]
	)

	const handlePriceSheetUploadError = useCallback(
		(error: Error) => {
			setError('price_sheet', {
				type: 'manual',
				message: t('uploadPriceSheetError', { message: error.message }),
			})
			toast.error(t('uploadPriceSheetError', { message: error.message }))
		},
		[setError, t]
	)

	const onSubmit = async (data: DealerRegisterFormData) => {
		if (!priceSheetUrl) {
			setError('price_sheet', {
				type: 'manual',
				message: t('pleaseUploadPriceSheet'),
			})
			return
		}

		registerDealerMutation.mutate(
			{
				booth_name: data.booth_name,
				description: data.description,
				price_sheet: priceSheetUrl,
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
		<div className='rounded-[30px] bg-[#E9F5E7] p-8 shadow-sm text-text-secondary'>
			<div className='flex items-center gap-3 mb-8'>
				<Store className='w-8 h-8 text-[#48715B]' />
				<h1 className='text-3xl font-bold text-center'>{t('registerTitle')}</h1>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
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
						className='w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-base text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#48715B] focus:border-transparent'
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
						rows={5}
						className='w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-base text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#48715B] focus:border-transparent resize-none'
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
						{t('priceSheet')} <span className='text-red-500'>*</span>
					</label>
					<ImageUploader
						onUploadSuccess={handlePriceSheetUploadSuccess}
						onUploadError={handlePriceSheetUploadError}
						folder='dealer-price-sheets'
						maxSizeMB={10}
						accept='image/*'
						initialImageUrl={priceSheetUrl}
						showPreview={true}
						buttonText={t('priceSheetButton')}
						label={t('priceSheetUploadLabel')}
						disabled={isSubmitting || registerDealerMutation.isPending}
					/>
					{errors.price_sheet && (
						<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
							{errors.price_sheet.message}
						</p>
					)}
					<p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
						{t('priceSheetHint')}
					</p>
				</div>

				<div className='pt-4'>
					<button
						type='submit'
						disabled={isSubmitting || registerDealerMutation.isPending}
						className='w-full py-3 px-4 rounded-lg bg-[#48715B] text-white font-medium transition-colors duration-200 hover:bg-[#3a5a4a] focus:outline-none focus:ring-2 focus:ring-[#48715B] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md'
					>
						{isSubmitting || registerDealerMutation.isPending
							? t('submittingRegister')
							: t('submitRegister')}
					</button>
				</div>

				<div className='relative mb-8'>
					<div className='absolute inset-0 flex items-center'>
						<div className='w-full border-t border-[#48715B]/30'></div>
					</div>
					<div className='relative flex justify-center text-sm'>
						<span className='px-4 bg-[#E9F5E7] text-[#48715B] font-medium'>
							{t('or')}
						</span>
					</div>
				</div>

				{!showJoinForm ? (
					<div className='mb-8 p-6 rounded-lg bg-white dark:bg-dark-surface border border-[#48715B]/30'>
						<div className='flex items-center gap-3 mb-4'>
							<Users className='w-6 h-6 text-[#48715B]' />
							<h2 className='text-xl font-semibold text-[#48715B]'>
								{t('joinExistingTitle')}
							</h2>
						</div>
						<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
							{t('joinExistingDesc')}
						</p>
						<button
							type='button'
							onClick={() => setShowJoinForm(true)}
							className='w-full py-2 px-4 rounded-lg bg-[#48715B] text-white font-medium transition-colors duration-200 hover:bg-[#3a5a4a] focus:outline-none focus:ring-2 focus:ring-[#48715B] focus:ring-offset-2 shadow-md'
						>
							{t('joinExistingButton')}
						</button>
					</div>
				) : (
					<div className='mb-8 p-6 rounded-lg bg-white dark:bg-dark-surface border border-[#48715B]/30'>
						<div className='flex items-center gap-3 mb-4'>
							<Users className='w-6 h-6 text-[#48715B]' />
							<h2 className='text-xl font-semibold text-[#48715B]'>
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
									className='w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-base text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#48715B] focus:border-transparent uppercase'
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

							<div className='flex gap-3 pt-2'>
								<button
									type='submit'
									disabled={isSubmittingJoin || joinDealerMutation.isPending}
									className='flex-1 py-2 px-4 rounded-lg bg-[#48715B] text-white font-medium transition-colors duration-200 hover:bg-[#3a5a4a] focus:outline-none focus:ring-2 focus:ring-[#48715B] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md'
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
									className='flex-1 py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md'
								>
									{tCommon('cancel')}
								</button>
							</div>
						</form>
					</div>
				)}

				<div className='mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'>
					<p className='text-sm text-blue-700 dark:text-blue-400'>
						{t('noteText')}
					</p>
				</div>
			</form>
		</div>
	)
}

export default DealerRegisterPage

'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Camera, FileText, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import ImageUploader from '@/components/common/ImageUploader'
import S3Image from '@/components/common/S3Image'
import Loading from '@/components/common/Loading'
import { FloatingLabelInput } from '@/components/auth/register/FloatingLabelInput'
import {
	ArtbookFormSchema,
	mapArtbookToApiRequest,
	UploadArtbookFormData,
} from '@/types/api/artbook/uploadArtbook'
import {
	useGetMyConbooks,
	useDeleteConbookSubmission,
	useUpdateConbookSubmission,
	useUploadArtbook,
} from '@/hooks/services/artbook/useUploadFile'
import Image from 'next/image'

const AccountConbookPage = (): React.ReactElement => {
	const isImageUrl = (url: string) => {
		const cleanUrl = url.split('?')[0].toLowerCase()
		return ['.jpg', '.jpeg', '.png'].some(
			ext => cleanUrl.endsWith(ext)
		)
	}
	const t = useTranslations('accountConbook')

	const getFileNameFromUrl = (url: string) => {
		try {
			const parsed = new URL(url)
			return decodeURIComponent(parsed.pathname.split('/').pop() || t('documentFallback'))
		} catch {
			return t('documentFallback')
		}
	}

	const [isSuccess, setIsSuccess] = useState(false)
	const [lastSubmitWasEdit, setLastSubmitWasEdit] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null)
	const [isClient, setIsClient] = useState(false)
	const [uploaderKey, setUploaderKey] = useState(0)

	useEffect(() => {
		setIsClient(true)
	}, [])

	useEffect(() => {
		if (!isSuccess) return
		const timer = setTimeout(() => {
			setIsSuccess(false)
		}, 3000)

		return () => clearTimeout(timer)
	}, [isSuccess])

	const {
		mutateAsync: uploadArtbook,
		isPending: isUploadingArtbook,
	} = useUploadArtbook()
	const {
		mutateAsync: updateConbook,
		isPending: isUpdatingConbook,
	} = useUpdateConbookSubmission()
	const {
		mutateAsync: deleteConbook,
		isPending: isDeletingConbook,
	} = useDeleteConbookSubmission()
	const {
		data: myConbooksResponse,
		isLoading: isLoadingSubmissions,
		isError: isLoadingSubmissionsError,
	} = useGetMyConbooks()

	const {
		control,
		handleSubmit,
		setValue,
		clearErrors,
		setError,
		reset,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<UploadArtbookFormData>({
		resolver: zodResolver(ArtbookFormSchema),
		defaultValues: {
			title: '',
			description: '',
			handle: '',
			image_url: null,
		},
	})

	const uploadedFileUrl = watch('image_url')

	const clearSelectedFile = () => {
		setZoomedImageUrl(null)
		setValue('image_url', null, { shouldValidate: true })
		setUploaderKey(prev => prev + 1)
	}

	const isSubmissionVerified = (isVerified?: boolean) => Boolean(isVerified)

	const startEdit = (item: {
		id: string
		title: string
		description: string
		handle: string
		image_url: string | null
		is_verified?: boolean
	}) => {
		if (isSubmissionVerified(item.is_verified)) return
		setEditingId(item.id)
		setIsSuccess(false)
		reset({
			title: item.title,
			description: item.description,
			handle: item.handle,
			image_url: item.image_url,
		})
	}

	const cancelEdit = () => {
		setEditingId(null)
		setIsSuccess(false)
		setUploaderKey(prev => prev + 1)
		reset({
			title: '',
			description: '',
			handle: '',
			image_url: null,
		})
	}

	const handleDelete = async (item: {
		id: string
		title: string
		is_verified?: boolean
	}) => {
		if (isSubmissionVerified(item.is_verified)) return

		try {
			setIsSuccess(false)
			clearErrors()
			await deleteConbook(item.id)

			if (editingId === item.id) {
				cancelEdit()
			}

			toast.success(t('deleteSuccess'))
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError('root', { type: 'manual', message: error.message })
				return
			}
			setError('root', { type: 'manual', message: t('deleteError') })
		}
	}
	const submissions = useMemo(() => {
		if (!myConbooksResponse?.isSuccess || !myConbooksResponse.data) {
			return []
		}
		return myConbooksResponse.data
	}, [myConbooksResponse])

	const prioritizedSubmissions = useMemo(() => {
		return [...submissions].sort((a, b) => {
			// Priority 1: approved submissions first
			const verificationPriority = Number(isSubmissionVerified(b.is_verified)) - Number(isSubmissionVerified(a.is_verified))
			if (verificationPriority !== 0) return verificationPriority

			// Priority 2: newest submissions first
			const dateA = new Date(a.created_at || a.createdAt || 0).getTime()
			const dateB = new Date(b.created_at || b.createdAt || 0).getTime()
			return dateB - dateA
		})
	}, [submissions])

	const onSubmit = async (formData: UploadArtbookFormData) => {
		try {
			setIsSuccess(false)
			clearErrors()
			const isEditSubmission = Boolean(editingId)

			if (!formData.image_url) {
				setError('image_url', {
					type: 'manual',
					message: t('pleaseUploadBeforeSubmitting'),
				})
				return
			}

			if (editingId) {
				await updateConbook({
					id: editingId,
					payload: mapArtbookToApiRequest(formData),
				})
				setEditingId(null)
			} else {
				await uploadArtbook(mapArtbookToApiRequest(formData))
			}
			setLastSubmitWasEdit(isEditSubmission)
			toast.success(
				isEditSubmission ? t('submissionUpdated') : t('submissionSuccess')
			)
			setIsSuccess(true)
			setZoomedImageUrl(null)
			setUploaderKey(prev => prev + 1)
			reset({
				title: '',
				description: '',
				handle: '',
				image_url: null,
			})
		} catch (error: unknown) {
			setIsSuccess(false)
			if (error instanceof Error) {
				setError('root', { type: 'manual', message: error.message })
			}
		}
	}

	return (
		<div className='relative w-full max-w-6xl mx-auto overflow-hidden rounded-[36px] bg-gradient-to-br from-[#f3fbef] via-[#edf7f2] to-[#e3efe9] px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10'>
			<Image
							src='/assets/common/drum_pattern.webp'
							alt={t('drumPatternAlt')}
							fill
							className='absolute inset-0 z-0 opacity-[3%] object-cover pointer-events-none'
							draggable={false}
						/>
			<div className='pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#84b893]/20 blur-3xl' />
			<div className='pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-[#48715B]/15 blur-3xl' />
			{isClient &&
				zoomedImageUrl &&
				createPortal(
					<div
						className='fixed inset-0 z-[1000] bg-black/85 backdrop-blur-[2px] flex items-center justify-center cursor-zoom-out'
						onClick={() => setZoomedImageUrl(null)}
					>
						{/* <div className='relative w-[80vw] h-[80vh] max-w-[1200px] max-h-[1200px]'>*/}
						<div className='relative w-full h-full max-w-[1200px] max-h-[1200px]'> 
							<S3Image
								src={zoomedImageUrl}
								alt={t('zoomedPreviewAlt')}
								fill
								className='object-contain'
                                // draggable={false}
							/>
						</div>
					</div>,
					document.body
				)}

			<div className='relative rounded-[30px] bg-transparent p-5 text-text-secondary shadow-[0_20px_60px_-30px_rgba(72,113,91,0.55)] backdrop-blur-sm sm:p-7 md:p-9'>
				<Image
							src='/assets/common/drum_pattern.webp'
							alt=''
							fill
							className='absolute inset-0 z-0 opacity-[3%] object-none pointer-events-none'
							draggable={false}
						/>
				<h2 className='text-2xl font-black tracking-tight text-text-primary sm:text-3xl md:text-[2rem]'>
					{t('title')}
				</h2>
				<p className='mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary/90'>
					{t('description')}
				</p>
				<div className='mt-3'>
					<Link href='/artbook' className='!border-none inline-flex items-center rounded-xl border border-[#48715B]/25 bg-white px-3 py-2 text-sm text-[#3a5a4a] transition-colors hover:!bg-[#48715B] hover:!text-[#f0f8f3] underline font-bold'>
						{t('readGuidelines')}
					</Link>
				</div>
				<form onSubmit={handleSubmit(onSubmit)} className='mt-7 flex flex-col gap-6'>
					{/* {isSuccess && (
						// <p className='rounded-xl border border-emerald-300/60 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800'>
						<p className='text-green-600 rounded-xl border border-emerald-300/60 bg-emerald-50 px-3 py-2 text-sm font-medium'>
	
						{lastSubmitWasEdit
								? t('submissionUpdated')
								: t('submissionSuccess')}
						</p>
					)} */}
					{errors.root?.message && (
						<p className='rounded-xl border border-rose-300/70 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700'>
							{errors.root.message}
						</p>
					)}

					<FloatingLabelInput
						id='title'
						name='title'
						control={control}
						type='text'
						label={t('labelTitle')}
						placeholder={t('placeholderTitle')}
					/>

					<FloatingLabelInput
						id='description'
						name='description'
						control={control}
						type='text'
						label={t('labelDescription')}
						placeholder={t('placeholderDescription')}
					/>

					<FloatingLabelInput
						id='handle'
						name='handle'
						control={control}
						type='text'
						label={t('labelHandle')}
						placeholder={t('placeholderHandle')}
					/>

					<ImageUploader
						key={uploaderKey}
						className='mb-10 h-24 rounded-2xl'
						folder='artbooks'
						accept='image/*,.doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf'
						maxSizeMB={15}
						// successMessageDurationMs={3000}
						onUploadSuccess={fileUrl => {
							setValue('image_url', fileUrl, { shouldValidate: true })
							setUploaderKey(prev => prev + 1)
						}}
						onRemove={() => {
							setValue('image_url', null)
							setUploaderKey(prev => prev + 1)
						}}
					/>

					{uploadedFileUrl && (
						isImageUrl(uploadedFileUrl) ? (
							<div
								className='group/preview relative mt-2 h-56 w-full cursor-zoom-in overflow-hidden rounded-2xl border border-[#48715B]/20 bg-white shadow-[0_14px_28px_-18px_rgba(48,82,65,0.65)] ring-1 ring-white/60'
								onClick={() => setZoomedImageUrl(uploadedFileUrl)}
							>
								<button
									type='button'
									className='absolute right-2 top-2 z-20 inline-flex items-center gap-1 rounded-full border border-white/50 bg-black/60 px-2 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-[#656565]'
									onClick={event => {
										event.preventDefault()
										event.stopPropagation()
										clearSelectedFile()
									}}
								>
									<X size={15} className='cursor-pointer'/>
								</button>
								<S3Image
									src={uploadedFileUrl}
									alt={t('previewAlt')}
									fill
									className='z-0 object-cover'
								/>
								<div
									className='pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center transition-all duration-200 bg-black/0 opacity-0 group-hover/preview:bg-black/40 group-hover/preview:opacity-100'
								>
									<Camera className='text-white drop-shadow' size={32} />
									<span className='mt-2 text-xs font-semibold text-white/95'>
										{t('clickToZoom')}
									</span>
								</div>
							</div>
						) : (
							<div className='relative mt-2 flex h-56 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-[#48715B]/20 bg-white p-4 text-center shadow-[0_14px_28px_-18px_rgba(48,82,65,0.65)] ring-1 ring-white/60'>
								<button
									type='button'
									className='absolute right-2 top-2 z-20 inline-flex items-center gap-1 rounded-full border border-[#48715B]/20 bg-[#f4faf6] px-2 py-1 text-[11px] font-semibold text-[#355643] transition-colors hover:bg-[#e8f2eb]'
									onClick={clearSelectedFile}
								>
									<X size={12} />
									{t('removeFile')}
								</button>
								<FileText className='w-12 h-12 text-[#48715B]' />
								<p className='text-sm text-[#48715B] break-all'>
									{getFileNameFromUrl(uploadedFileUrl)}
								</p>
							</div>
						)
					)}

					{errors.image_url && (
						<p className='text-sm font-medium text-rose-600'>{errors.image_url.message}</p>
					)}

					<div className='flex flex-col gap-3 pt-2 sm:flex-row'>
						<Button
							className='cursor-pointer !border-none w-full !bg-[#3f654f] !text-white shadow-[0_12px_24px_-14px_rgba(48,82,65,0.9)] transition-all hover:-translate-y-[1px] hover:!bg-[#355643] sm:min-w-[360px]'
							props={{ disabled: isUploadingArtbook || isUpdatingConbook || isSubmitting }}
						>
							{isSubmitting
								? editingId
									? t('saving')
									: t('submitting')
								: editingId
									? t('saveChanges')
									: t('submitButton')}
						</Button>

						{editingId && (
							<Button
								className='cursor-pointer border border-[#48715B]/30 bg-white text-[#355643] transition-colors hover:bg-[#ecf6ef] sm:min-w-[140px]'
								props={{
									type: 'button',
									onClick: cancelEdit,
									disabled: isUploadingArtbook || isUpdatingConbook || isSubmitting,
								}}
							>
								{t('cancelEdit')}
							</Button>
						)}
					</div>
				</form>
			</div>

			<div className='relative rounded-[30px] border mt-10 border-[#48715B]/15 bg-transparent p-5 text-text-secondary shadow-[0_20px_60px_-30px_rgba(72,113,91,0.55)] backdrop-blur-sm sm:p-7 md:p-9'>
				<Image
							src='/assets/common/drum_pattern.webp'
							alt=''
							fill
							className='absolute inset-0 z-0 opacity-[3%] object-cover pointer-events-none'
							draggable={false}
						/>
				<h3 className='text-xl font-black tracking-tight text-text-primary sm:text-2xl'>
					{t('mySubmissions', { count: submissions.length })}
				</h3>

				{isLoadingSubmissions ? (
					<div className='mt-4'>
						<Loading />
					</div>
				) : isLoadingSubmissionsError ? (
					<p className='mt-4 text-sm text-red-600'>
						{t('unableToLoadSubmissions')}
					</p>
				) : submissions.length === 0 ? (
					<p className='mt-4 text-sm text-text-secondary'>
						{t('noSubmissions')}
					</p>
				) : (
					<div className='mt-5 grid grid-cols-1 gap-4 md:grid-cols-2'>
						{prioritizedSubmissions.map(item => (
							<div
								key={item.id}
								className='group flex h-full flex-col gap-3 rounded-2xl border border-[#48715B]/20 bg-gradient-to-b from-white to-[#f8fcf9] p-4 shadow-[0_14px_28px_-20px_rgba(42,74,59,0.9)] transition-all hover:-translate-y-[2px]'
							>
								<div>
									<p className='font-bold text-text-primary transition-colors text-xl'>{item.title}</p>
									<p className='text-sm text-text-secondary/90 break-words'>
										{item.description}
									</p>
									<p className='mt-1 text-xs text-[#48715B]'>
										{item.handle}
									</p>
								</div>
								<div className='mt-auto space-y-3'>
									<p
										className={`mt-2 inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${
											item.is_verified
												? 'border-emerald-300/70 bg-emerald-100 text-emerald-800'
												: 'border-amber-300/70 bg-amber-100 text-amber-800'
										}`}
									>
										{item.is_verified ? t('verified') : t('pendingVerification')}
									</p>
									{item.image_url &&
									(isImageUrl(item.image_url) ? (
										<div
											className='group/preview relative h-40 w-full cursor-zoom-in overflow-hidden rounded-xl border border-[#48715B]/20 bg-[#edf5ef]'
											onClick={() => setZoomedImageUrl(item.image_url as string)}
										>
											<S3Image
												src={item.image_url}
												alt={item.title}
												fill
												className='z-0 object-cover'
											/>
											<div className='pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center transition-all duration-200 bg-black/0 opacity-0 group-hover/preview:bg-black/40 group-hover/preview:opacity-100'>
												<Camera className='text-white drop-shadow' size={24} />
												<span className='mt-1 text-[11px] font-semibold text-white/95'>
													{t('clickToZoom')}
												</span>
											</div>
										</div>
									) : (
										<div className='flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border border-[#48715B]/20 bg-[#e2eee2] p-4 text-center'>
											<FileText className='w-10 h-10 text-[#48715B]' />
											<p className='text-xs text-[#48715B] break-all'>
												{getFileNameFromUrl(item.image_url)}
											</p>
										</div>
									))}
								</div>
								<div className='pt-1 flex gap-2 justify-between'>
									<Button
										// className='cursor-pointer border border-[#48715B]/25 !bg-[#3f654f] !text-[#f0f8f3] transition-colors hover:!bg-[#335241] hover:!text-[#f0f8f3]'
										className='cursor-pointer'
										props={{
											type: 'button',
											onClick: () => startEdit(item),
											disabled:
												isSubmissionVerified(item.is_verified) ||
												isDeletingConbook ||
												isUpdatingConbook ||
												isUploadingArtbook,
										}}
									>
											{isSubmissionVerified(item.is_verified)
												? t('verifiedByStaff')
												: t('editSubmission')}
									</Button>
									<Button
										className='cursor-pointer border border-rose-300/70 bg-white !text-rose-700 transition-colors hover:bg-rose-50'
										props={{
											type: 'button',
											onClick: () => handleDelete(item),
											disabled:
												isSubmissionVerified(item.is_verified) ||
												isDeletingConbook ||
												isUpdatingConbook ||
												isUploadingArtbook,
										}}
									>
										<span className='inline-flex items-center gap-1'>
											<Trash2 size={14} />
											{isDeletingConbook ? t('deleting') : t('deleteSubmission')}
										</span>
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

export default AccountConbookPage

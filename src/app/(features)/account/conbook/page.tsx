'use client'

import React, { useMemo, useState } from 'react'
import { FileText } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
	useUpdateConbookSubmission,
	useUploadArtbook,
} from '@/hooks/services/artbook/useUploadFile'

const AccountConbookPage = (): React.ReactElement => {
	const isImageUrl = (url: string) => {
		const cleanUrl = url.split('?')[0].toLowerCase()
		return ['.jpg', '.jpeg', '.png'].some(
			ext => cleanUrl.endsWith(ext)
		)
	}

	const getFileNameFromUrl = (url: string) => {
		try {
			const parsed = new URL(url)
			return decodeURIComponent(parsed.pathname.split('/').pop() || 'Document')
		} catch {
			return 'Document'
		}
	}

	const [isSuccess, setIsSuccess] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const {
		mutateAsync: uploadArtbook,
		isPending: isUploadingArtbook,
	} = useUploadArtbook()
	const {
		mutateAsync: updateConbook,
		isPending: isUpdatingConbook,
	} = useUpdateConbookSubmission()
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
		reset({
			title: '',
			description: '',
			handle: '',
			image_url: null,
		})
	}
	const submissions = useMemo(() => {
		if (!myConbooksResponse?.isSuccess || !myConbooksResponse.data) {
			return []
		}
		return myConbooksResponse.data
	}, [myConbooksResponse])

	const onSubmit = async (formData: UploadArtbookFormData) => {
		try {
			setIsSuccess(false)
			clearErrors()

			if (!formData.image_url) {
				setError('image_url', {
					type: 'manual',
					message: 'Please upload a file before submitting.',
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
			setIsSuccess(true)
			reset()
		} catch (error: unknown) {
			setIsSuccess(false)
			if (error instanceof Error) {
				setError('root', { type: 'manual', message: error.message })
			}
		}
	}

	return (
		<div className='w-full space-y-6'>
			<div className='rounded-[30px] bg-[#E9F5E7] p-4 sm:p-6 md:p-8 shadow-sm text-text-secondary'>
				<h2 className='text-2xl sm:text-3xl font-bold text-text-primary'>
					Submit Conbook
				</h2>
				<p className='mt-2 text-sm text-text-secondary'>
					Submit your artwork and manage your own conbook submissions here.
				</p>
				<div className='mt-3'>
					<Link href='/artbook' className='text-sm font-medium text-[#48715B] hover:underline'>
						View conbook rules
					</Link>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className='mt-6 flex flex-col gap-6'>
					{isSuccess && (
						<p className='text-green-700 text-sm'>
							{editingId ? 'Submission updated successfully!' : 'Submission successful!'}
						</p>
					)}
					{errors.root?.message && (
						<p className='text-red-600 text-sm'>{errors.root.message}</p>
					)}

					<FloatingLabelInput
						id='title'
						name='title'
						control={control}
						type='text'
						label='Title'
						placeholder='Enter your artwork title'
					/>

					<FloatingLabelInput
						id='description'
						name='description'
						control={control}
						type='text'
						label='Description'
						placeholder='Enter your artwork description'
					/>

					<FloatingLabelInput
						id='handle'
						name='handle'
						control={control}
						type='text'
						label='Social Handle'
						placeholder='Your social handle (e.g. name - Twitter)'
					/>

					<ImageUploader
						className='h-24'
						folder='artbooks'
						accept='image/*,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
						maxSizeMB={15}
						onUploadSuccess={fileUrl => {
							setValue('image_url', fileUrl, { shouldValidate: true })
						}}
						onRemove={() => {
							setValue('image_url', null)
						}}
					/>

					{uploadedFileUrl && (
						isImageUrl(uploadedFileUrl) ? (
							<div className='relative mt-12 -mb-5 h-48 w-full rounded-xl overflow-hidden border border-[#48715B]/20 bg-white'>
								<S3Image
									src={uploadedFileUrl}
									alt='Preview'
									fill
									className='object-contain'
								/>
							</div>
						) : (
							<div className='mt-12 -mb-5 h-48 w-full rounded-xl border border-[#48715B]/20 bg-white p-4 flex flex-col items-center justify-center gap-2 text-center'>
								<FileText className='w-12 h-12 text-[#48715B]' />
								<p className='text-sm text-[#48715B] break-all'>
									{getFileNameFromUrl(uploadedFileUrl)}
								</p>
							</div>
						)
					)}

					{errors.image_url && (
						<p className='text-sm text-red-500'>{errors.image_url.message}</p>
					)}

					<Button
						className='mt-10 cursor-pointer'
						props={{ disabled: isUploadingArtbook || isUpdatingConbook || isSubmitting }}
					>
						{isSubmitting
							? editingId
								? 'Saving...'
								: 'Submitting...'
							: editingId
								? 'Save Changes'
								: 'Submit Conbook'}
					</Button>

					{editingId && (
						<Button
							className='cursor-pointer'
							props={{
								type: 'button',
								onClick: cancelEdit,
								disabled: isUploadingArtbook || isUpdatingConbook || isSubmitting,
							}}
						>
							Cancel Edit
						</Button>
					)}
				</form>
			</div>

			<div className='rounded-[30px] bg-[#E9F5E7] p-4 sm:p-6 md:p-8 shadow-sm text-text-secondary'>
				<h3 className='text-xl sm:text-2xl font-bold text-text-primary'>
					My Submissions
				</h3>

				{isLoadingSubmissions ? (
					<div className='mt-4'>
						<Loading />
					</div>
				) : isLoadingSubmissionsError ? (
					<p className='mt-4 text-sm text-red-600'>
						Unable to load your submissions right now.
					</p>
				) : submissions.length === 0 ? (
					<p className='mt-4 text-sm text-text-secondary'>
						You have not submitted any conbook yet.
					</p>
				) : (
					<div className='mt-5 grid grid-cols-1 md:grid-cols-2 gap-4'>
						{submissions.map(item => (
							<div
								key={item.id}
								className='rounded-2xl border border-[#48715B]/20 bg-white p-4 space-y-3'
							>
								<div>
									<p className='font-semibold text-text-primary'>Title: {item.title}</p>
									<p className='text-sm text-text-secondary break-words'>
										Description: {item.description}
									</p>
									<p className='text-xs text-[#48715B] mt-1'>Handle: {item.handle}</p>
									<p className='text-xs text-[#48715B]/70 mt-1'>
										Status: {item.is_verified ? 'Verified' : 'Pending verification'}
									</p>
								</div>
								{item.image_url &&
									(isImageUrl(item.image_url) ? (
										<div className='relative h-40 w-full rounded-lg overflow-hidden border border-[#48715B]/20'>
											<S3Image
												src={item.image_url}
												alt={item.title}
												fill
												className='object-contain bg-[#E2EEE2]'
											/>
										</div>
									) : (
										<div className='h-40 w-full rounded-lg border border-[#48715B]/20 bg-[#E2EEE2] p-4 flex flex-col items-center justify-center gap-2 text-center'>
											<FileText className='w-10 h-10 text-[#48715B]' />
											<p className='text-xs text-[#48715B] break-all'>
												{getFileNameFromUrl(item.image_url)}
											</p>
										</div>
									))}
								<div className='pt-1'>
									<Button
										className='cursor-pointer'
										props={{
											type: 'button',
											onClick: () => startEdit(item),
											disabled: isSubmissionVerified(item.is_verified),
										}}
									>
										{isSubmissionVerified(item.is_verified) ? 'Verified by staff' : 'Edit submission'}
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

'use client'

import GrainyBox from '@/components/boxes/GrainyBox'
// import SideImage from '@/components/boxes/SideImage'
import Button from '@/components/ui/Button'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  UploadArtbookFormData,
  ArtbookFormSchema,
} from '@/types/api/artbook/uploadArtbook'
// import DrumImage from '@/components/landing/DrumImage'
import { FloatingLabelInput } from '@/components/auth/register/FloatingLabelInput'
import ImageUploader from '@/components/common/ImageUploader'
import { useAuthStore } from '@/stores/authStore'
import Link from 'next/link'
import S3Image from '@/components/common/S3Image'
import { useUploadArtbook } from '@/hooks/services/artbook/useUploadFile'

const ArtBookCardSection = () => {
  const t = useTranslations('artbook')
  const isLoggedIn = useAuthStore(state => state.isAuthenticated)
  const [isSuccess, setIsSuccess] = useState(false)
  const {
  mutateAsync: uploadArtbook,
  isPending: isUploadingArtbook,
} = useUploadArtbook()

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
    //   fileKey: null,
    },
  })

  const uploadedFileUrl = watch('image_url')

  const onSubmit = async (data: UploadArtbookFormData) => {
    try {
      clearErrors()

      if (!data.image_url) {
        setError('image_url', {
          type: 'manual',
          message: 'Please upload a file before submitting.',
        })
        return
      }

      console.log('Final Submit Payload:', data)
      await uploadArtbook(data)

      setIsSuccess(true)
      reset()
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError('root', { type: 'manual', message: error.message })
      }
    }
  }
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
		<div className="relative flex flex-col md:flex-row shadow-xl">

		{/* LEFT PANEL */}
		<div className="md:w-[1700px] bg-[#48715B] px-16 py-20 flex flex-col rounded-2xl md:rounded-r-none z-10">
  			<div className="max-w-lg">
				<h3 className="text-2xl font-bold text-[#E2EEE2] text-center">
				{t('artbook.card.title')}
				</h3>

				<p className="text-[#E2EEE2] text-sm mt-4 leading-relaxed">
				{t('artbook.card.description1')}
				</p>

				<p className="text-[#E2EEE2] text-sm mt-4 leading-relaxed">
				{t('artbook.card.description2')}
				</p>
				</div>
		</div>

		{/* RIGHT PANEL */}
		<div className="md:w-max bg-[#E2EEE2] p-12 rounded-2xl md:-ml-10 relative shadow-2xl z-20">
			<h3 className="text-2xl text-center font-bold text-secondary mb-6">
			{t('artbook.card.righttitle')}
			</h3>
			{/* appear when user not logged in */}
			{!isLoggedIn ? (
			<>
				<p className="text-[#48715B] text-sm mt-4 leading-relaxed">
				{t('artbook.card.rightdescription')}
				</p>

				<div className="flex flex-col justify-center">

				<Button className="mt-10 w-full" props={{ disabled: true }}>
				{t('artbook.card.buttonDisable')}
				</Button>
				{/* Links */}
					<div className='text-center text-nowrap text-secondary mt-2'>
						<Link href='/login'>{t('artbook.card.login')}</Link>
						<span> | </span>
						<Link href='/ticket'>{t('artbook.card.buyticket')}</Link>
					</div>
				</div>
			</>
			) : (
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col gap-6"
			>
				{isSuccess && (
				<p className="text-green-600 text-sm mt-2">
					Submission successful!
				</p>
				)}
				<FloatingLabelInput
				id="title"
				name="title"
				control={control}
				type="text"
				label={t('artbook.card.labelTitle')}
				placeholder={t('artbook.card.placeholderTitle')}
				/>

				<FloatingLabelInput
				id="description"
				name="description"
				control={control}
				type="text"
				label={t('artbook.card.labelDescription')}
				placeholder={t('artbook.card.placeholderDescription')}
				/>

				<FloatingLabelInput
				id="handle"
				name="handle"
				control={control}
				type="text"
				label={t('artbook.card.labelHandle')}
				placeholder={t('artbook.card.placeholderHandle')}
				/>

				<ImageUploader
				className="h-24"
				folder="artbooks"
				accept="image/*"
				maxSizeMB={15}
				onUploadSuccess={(fileUrl) => {
					setValue('image_url', fileUrl, { shouldValidate: true })
				}}
				onRemove={() => {
					setValue('image_url', null)
				}}
				/>

				{uploadedFileUrl && (
				<div className="relative mt-4 h-48 w-full">
					<S3Image
					src={uploadedFileUrl}
					alt="Preview"
					fill
					className="rounded-lg object-contain border"
					/>
				</div>
				)}

				{errors.image_url && (
				<p className="text-sm text-red-500">
					{errors.image_url.message}
				</p>
				)}

				<Button
				className="mt-10 cursor-pointer"
				props={{ disabled: isUploadingArtbook }}
				>
				{isSubmitting
					? 'Submitting...'
					: t('artbook.card.button')}
				</Button>
			</form>
			)}

			{/* <div className='fixed inset-0 flex items-center justify-center pointer-events-none overflow-visible'>
				<DrumImage id='feat-drum' />
			</div> */}

			{/* <div className="absolute inset-0 [-webkit-mask-image:url('/textures/asfalt-dark.png')] [mask-image:url('/textures/asfalt-dark.png')] [-webkit-mask-repeat:repeat] [mask-repeat:repeat] [-webkit-mask-size:100px] [mask-size:100px] bg-[rgba(0,0,0,0.6)]" /> */}
			</div>

			<GrainyBox />
		</div>
	</div>
  )
}

export default ArtBookCardSection
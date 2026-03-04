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

const ArtBookCardSection = () => {
  const t = useTranslations('artbook')
  const [isSuccess, setIsSuccess] = useState(false)

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
      imageUrl: null,
    //   fileKey: null,
    },
  })

  const uploadedFileUrl = watch('imageUrl')

  const onSubmit = async (data: UploadArtbookFormData) => {
    try {
      clearErrors()

      if (!data.imageUrl) {
        setError('imageUrl', {
          type: 'manual',
          message: 'Please upload a file before submitting.',
        })
        return
      }

      console.log('Final Submit Payload:', data)
      // await uploadArtbook(data)

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
		<div className="md:w-[1300px] bg-[#48715B] px-16 py-20 flex flex-col rounded-2xl md:rounded-r-none z-10">
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

			<form
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col gap-6"
			>
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
				accept="image/*,application/pdf"
				maxSizeMB={15}
				onUploadSuccess={(fileUrl) => {
				// onUploadSuccess={(fileUrl, fileKey) => {
				setValue('imageUrl', fileUrl, { shouldValidate: true })
				}}
				onRemove={() => {
				setValue('imageUrl', null)
				}}
			/>

			{errors.imageUrl && (
				<p className="text-sm text-red-500">
				{errors.imageUrl.message}
				</p>
			)}

				<Button 
				className='mt-10 cursor-pointer'
				disabled={isSubmitting}>
					{isSubmitting
					? 'Submitting...'
					: t('artbook.card.button')}
				</Button>
				</form>

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
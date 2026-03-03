'use client'
import GrainyBox from '@/components/boxes/GrainyBox'
import SideImage from '@/components/boxes/SideImage'
import Button from '@/components/ui/Button'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { UploadArtbookFormData } from '@/types/api/artbook/uploadArtbook'
import { ArtbookFormSchema } from '@/types/api/artbook/uploadArtbook'

const ArtBookCardSection = () => {
	const [isSuccess, setIsSuccess] = useState(false)
	const t = useTranslations('artbook')

	const {
		control,
		handleSubmit,
		clearErrors,
		formState: { errors, isSubmitting },
		setError,
		reset,
	} = useForm<UploadArtbookFormData>({
		resolver: zodResolver(ArtbookFormSchema),
		defaultValues: {
			title: '',
			description: '',
			Handle: '',
			ImageUrl: null,
		},
	})

	const onSubmit = async (data: UploadArtbookFormData) => {
		try {
			clearErrors()
			console.log('Form data:', data)
			setIsSuccess(true)
			reset()
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError('root', { type: 'manual', message: error.message })
			} else {
				setError('root', { type: 'manual', message: t('uploadFailed') })
			}
		}
	}

	return (
		<div className='flex h-full max-w-[750px] items-center mx-auto relative'>
			{/* Left */}
			<div className='relative z-10 w-1/2 flex justify-center items-center ml-12 py-10 px-14 h-full'>
				<SideImage
					src='/images/artbook/badges.png'
					alt={t('artbook.card.imageAlt')}
				/>
			</div>

			{/* Right */}
			<div className='-ml-12 relative w-full'>
				<div className='absolute inset-0'>
					{/* main content */}
					<section className='relative z-10 flex flex-col justify-around py-10 px-14 h-full bg-[#E2EEE2] rounded-2xl'>
						<h3 className='flex-1 text-2xl text-center font-bold text-secondary'>
							{t('artbook.card.title')}
						</h3>
						<p className='flex-3 grow text-text-primary mt-4 font-sm'>
							{t('artbook.card.description')}
						</p>
						<Button>{t('artbook.card.button')}</Button>
						<div className='text-center text-nowrap text-secondary'>
							<Link href='/login'>{t('artbook.card.login')}</Link>
							<span> | </span>
							<Link href='/ticket'>{t('artbook.card.buyticket')}</Link>
						</div>
					</section>

					{/* extra mask */}
					<div className="absolute inset-0 [-webkit-mask-image:url('/textures/asfalt-dark.png')] [mask-image:url('/textures/asfalt-dark.png')] [-webkit-mask-repeat:repeat] [mask-repeat:repeat] [-webkit-mask-size:100px] [mask-size:100px] bg-[rgba(0,0,0,0.6)]" />
				</div>

				{/* main box with grain */}
				<GrainyBox />
			</div>
		</div>
	)
}

export default ArtBookCardSection

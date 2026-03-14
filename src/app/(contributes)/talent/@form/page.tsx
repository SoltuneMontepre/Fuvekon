'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import CollapsibleScroll from '@/components/animated/CollapsibleScroll'
import Separator from '@/components/common/scroll/Separator'

const TalentForm = () => {
	const t = useTranslations('talent.talent.form')

	return (
		<CollapsibleScroll
			initialOpen
			openable={false}
			className='lg:w-5xl mx-auto md:w-3xl'
		>
			<div className='pt-5 pb-5'>
				<p className='text-text-primary text-md leading-relaxed mb-4'>
					{t('intro1')}
				</p>
				<p className='text-text-primary text-md leading-relaxed'>
					{t('intro2')}
				</p>
			</div>
			<Separator className='w-[95%] mx-auto' />
			{/* Form content can be added below */}
		</CollapsibleScroll>
	)
}

export default TalentForm

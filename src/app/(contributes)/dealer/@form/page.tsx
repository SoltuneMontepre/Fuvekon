'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import CollapsibleScroll from '@/components/animated/CollapsibleScroll'
import Separator from '@/components/common/scroll/Separator'

const DealerForm = () => {
	const t = useTranslations('dealer.dealer.form')

	return (
		<CollapsibleScroll
			initialOpen
			openable={false}
			className='lg:w-5xl mx-auto md:w-3xl'
		>
			<div className='pt-5 pb-5'>
				<p className="scroll-title pt-5 josefin bg-[url('/textures/asfalt-dark.png')] bg-primary bg-clip-text text-transparent">
					{t('intro1')}
				</p>
				<Separator className='w-[95%] mx-auto' />
				<p className='text-text-primary text-md leading-relaxed mb-4'>
					{t('intro2')}
				</p>
				<h4 className='text-text-primary text-md font-bold mb-2 mt-4'>
					{t('processTitle')}
				</h4>
				<ul className='list-decimal list-inside text-text-primary text-md leading-relaxed space-y-1 mb-4'>
					<li>{t('process1')}</li>
					<li>{t('process2')}</li>
					<li>{t('process3')}</li>
					<li>{t('process4')}</li>
					<li>{t('process5')}</li>
				</ul>
				<h4 className='text-text-primary text-md font-bold mb-2 mt-4'>
					{t('joinTitle')}
				</h4>
				<ul className='list-decimal list-inside text-text-primary text-md leading-relaxed space-y-1 mb-4'>
					<li>{t('join1')}</li>
					<li>{t('join2')}</li>
					<li>{t('join3')}</li>
					<li>{t('join4')}</li>
				</ul>
				<p className='text-text-primary text-md leading-relaxed mb-4 italic'>
					{t('noteNoNewRegistration')}
				</p>
				<h4 className='text-text-primary text-md font-bold mb-2 mt-4'>
					{t('notesTitle')}
				</h4>
				<ul className='list-disc list-inside text-text-primary text-md leading-relaxed space-y-1'>
					<li>{t('note1')}</li>
					<li>{t('note2')}</li>
					<li>{t('note3')}</li>
					<li>{t('note4')}</li>
				</ul>
			</div>
			<Separator className='w-[95%] mx-auto' />
			{/* Form content can be added below */}
		</CollapsibleScroll>
	)
}

export default DealerForm

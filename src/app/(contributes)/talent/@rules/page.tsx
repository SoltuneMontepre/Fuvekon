import CollapsibleScroll from '@/components/animated/CollapsibleScroll'
import Separator from '@/components/common/scroll/Separator'
import { useTranslations } from 'next-intl'
import React from 'react'

const TalentRuleSection = () => {
	const t = useTranslations('talent.talent.rules')
	const ruleKeys = [
		'item1',
		'item2',
		'item3',
		'item4',
		'item5',
		'item6',
		'item7',
		'item8',
		'item9',
		'item10',
		'item11',
		'item12',
		'item13',
		'item14',
		'item15',
	]
	const rules = ruleKeys.map(key => t(key))

	return (
		<CollapsibleScroll
			initialOpen
			openable={false}
			className='lg:w-5xl mx-auto  md:w-3xl'
		>
			<h3 className="scroll-title pt-5 josefin bg-[url('/textures/asfalt-dark.png')] bg-primary bg-clip-text text-transparent">
				{t('title')}
			</h3>
			<Separator className='w-[95%] mx-auto' />
			<div className='text-text-primary text-md font-sm'>
				{rules.map((rule, index) => (
					<p
						key={index}
						className={`${index === 0 || index === 13 ? 'font-bold' : ''} ${index === 13 ? 'mt-4' : ''}`}
					>
						{rule}
					</p>
				))}
			</div>
			<div className='pb-5' />
		</CollapsibleScroll>
	)
}

export default TalentRuleSection

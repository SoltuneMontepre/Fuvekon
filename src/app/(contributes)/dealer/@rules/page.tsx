import CollapsibleScroll from '@/components/animated/CollapsibleScroll'
import Separator from '@/components/common/scroll/Separator'
import { useTranslations } from 'next-intl'
import React from 'react'

const DEALER_RULE_BOLD_INDICES = [0, 10, 16] // section headers: products, area, organizer
const SUB_BULLET = '\u25CB' // ○ white circle

const DealerRuleSection = () => {
	const t = useTranslations('dealer.dealer.rules')
	const ruleKeys = Array.from({ length: 20 }, (_, i) => `item${i + 1}`)
	const rules = ruleKeys.map(key => t(key))

	const isSectionStart = (i: number) => i === 10 || i === 16

	return (
		<CollapsibleScroll
			initialOpen
			openable={false}
			className='lg:w-5xl mx-auto  md:w-3xl'
		>
			<div className='pt-2'>
				<h3 className="scroll-title pt-6 josefin bg-[url('/textures/asfalt-dark.png')] bg-primary bg-clip-text text-transparent">
					{t('title')}
				</h3>
			</div>
			<Separator className='w-[95%] mx-auto' />
			<div className='text-text-primary text-md font-sm'>
				{rules.map((rule, index) => {
					// item4: "Items not allowed" — render main line + sub-list for ○ items
					if (index === 3 && rule.includes(SUB_BULLET)) {
						const parts = rule
							.split(SUB_BULLET)
							.map(s => s.trim())
							.filter(Boolean)
						const mainLine = parts[0]
						const subItems = parts.slice(1)
						return (
							<div key={index}>
								<p>{mainLine}</p>
								<ul className='list-disc list-inside ml-4 mt-1 space-y-0.5'>
									{subItems.map((item, i) => (
										<li key={i}>{item}</li>
									))}
								</ul>
							</div>
						)
					}
					return (
						<p
							key={index}
							className={`${DEALER_RULE_BOLD_INDICES.includes(index) ? 'font-bold' : ''} ${isSectionStart(index) ? 'mt-4' : ''}`}
						>
							{rule}
						</p>
					)
				})}
			</div>
			<div className='pb-5' />
		</CollapsibleScroll>
	)
}

export default DealerRuleSection

'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { TicketTier } from '@/types/models/ticket/ticket'

interface TierCardProps {
	tier: TicketTier
	onPurchase: (tierId: string) => void
	isPurchasing: boolean
	isDisabled: boolean
	disabledReason?: string
}

// Format price in VND
const formatPrice = (price: number): string => {
	return new Intl.NumberFormat('vi-VN', {
		style: 'decimal',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

const TierCard = ({
	tier,
	onPurchase,
	isPurchasing,
	isDisabled,
	disabledReason,
}: TierCardProps): React.ReactElement => {
	const t = useTranslations('ticket')
	const tCommon = useTranslations('common')
	const isSoldOut = tier.stock <= 0

	const handleClick = () => {
		if (!isDisabled && !isSoldOut && !isPurchasing) {
			onPurchase(tier.id)
		}
	}

	return (
		<div className='flex flex-col rounded-[20px] border-4 border-[#548780] bg-[#e2eee2] shadow-[6px_6px_15px_0px_rgba(0,0,0,0.63)] overflow-hidden'>
			{/* Tier Header */}
			<div className='bg-[#7cbc97] px-6 py-4 text-center'>
				<h3 className='text-2xl font-bold text-[#154c5b] uppercase tracking-wide josefin'>
					{tier.ticket_name}
				</h3>
			</div>

			{/* Price Section */}
			<div className='bg-[#548780] px-6 py-6 text-center'>
				<div className='text-4xl font-bold text-[#e2eee2]'>{formatPrice(tier.price)}</div>
				<div className='text-lg text-[#e2eee2] mt-1'>VND</div>
			</div>

			{/* Benefits List */}
			<div className='flex-1 px-6 py-6'>
				<p className='text-sm text-[#48715b] mb-4'>{tier.description}</p>
				{tier.benefits && tier.benefits.length > 0 && (
					<ul className='space-y-3'>
						{tier.benefits.map((benefit, index) => (
							<li key={index} className='flex items-start gap-3'>
								<span className='flex-shrink-0 w-5 h-5 rounded-full bg-[#7cbc97] flex items-center justify-center mt-0.5'>
									<Check className='w-3 h-3 text-white' />
								</span>
								<span className='text-[#154c5b] text-sm'>{benefit}</span>
							</li>
						))}
					</ul>
				)}
			</div>

			{/* Stock Indicator */}
			<div className='px-6 pb-2'>
				<div className='text-center text-sm'>
					{isSoldOut ? (
						<span className='text-red-600 font-semibold'>{t('soldOut')}</span>
					) : (
						<span className='text-[#48715b]'>{t('remaining', { count: tier.stock })}</span>
					)}
				</div>
			</div>

			{/* Purchase Button */}
			<div className='px-6 pb-6'>
				<button
					onClick={handleClick}
					disabled={isDisabled || isSoldOut || isPurchasing}
					className={`
						w-full py-3 px-6 rounded-[12px] font-semibold text-lg uppercase tracking-wide
						transition-all duration-200
						shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
						${
							isDisabled || isSoldOut || isPurchasing
								? 'bg-gray-300 text-gray-500 cursor-not-allowed'
								: 'bg-[#e2eee2] text-[#48715b] hover:bg-[#d2ddd2] active:translate-y-0.5'
						}
					`}
				>
					{isPurchasing
						? tCommon('processing')
						: isSoldOut
							? t('soldOut')
							: isDisabled
								? disabledReason || t('soldOut')
								: t('buyNow')}
				</button>
			</div>
		</div>
	)
}

export default TierCard

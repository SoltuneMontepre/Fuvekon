'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import type { TicketTier } from '@/types/models/ticket/ticketTier'
import { Check } from 'lucide-react'
import ScrollHeader from './ScrollHeader'

interface TicketTierCardProps {
	tier: TicketTier
	showBuyButton?: boolean
}

const TicketTierCard: React.FC<TicketTierCardProps> = ({
	tier,
}) => {
	const t = useTranslations('ticket')

	// Format price with Vietnamese Dong formatting
	const formatPrice = (price: number): string => {
		return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ'
	}

	// Get tier name translation
	const getTierName = (tierNumber: number): string => {
		switch (tierNumber) {
			case 1:
				return t('tier1')
			case 2:
				return t('tier2')
			case 3:
				return t('tier3')
			default:
				return tier.ticketName
		}
	}

	// Extract tier number from ticket name (e.g., "Tier 1" -> 1)
	const tierNumber = tier.ticketName.toLowerCase().includes('tier')
		? parseInt(tier.ticketName.match(/\d+/)?.[0] || '1')
		: 1

	return (
		<div className='relative w-full flex flex-col items-center'>
			{/* Scroll decoration - header */}
			<div className='relative w-full h-16 mb-0 z-20 ms-[-15%]'>
				<ScrollHeader />
			</div>

			{/* Main card */}
			<div className='relative min-h-[90vh] mt-[-8%] bg-[#e2eee2] border-4 border-[#548780] rounded-[20px]  overflow-hidden w-full -mt-1'>
				{/* Banner image */}
				{tier.bannerImage && (
					<div className='relative h-[20vh] w-full overflow-hidden'>
						<Image
							src={tier.bannerImage}
							alt={tier.ticketName}
							fill
							className='object-cover'
							priority
						/>
						{/* Overlay shadow */}
						<div className='absolute inset-0 shadow-[inset_0px_226px_4px_0px_rgba(0,0,0,0.25)]' />
						
						{/* Tier name - overlaying the banner */}
						<div className='absolute inset-0 flex items-center justify-center z-10'>
							<h2
								className='tier-name text-[96px] font-normal text-[#7cbc97]'
								style={{
									textShadow: '3px 4px 8.9px rgba(0,0,0,0.55)',
								}}
							>
								{getTierName(tierNumber)}
							</h2>
						</div>

						{/* Price - overlaying the banner */}
						<div className='absolute bottom-4 right-4 z-10'>
							<p className='josefin text-[30px] text-[#e2eee2] font-normal'>
								{formatPrice(tier.price)}
							</p>
						</div>
					</div>
				)}

				{/* Drum pattern overlay */}
				<div className='absolute inset-0 opacity-30 pointer-events-none'>
					<Image
						src='/images/landing/drum_pattern.webp'
						alt=''
						fill
						className='object-cover opacity-50'
					/>
				</div>

				{/* Content */}
				<div className='relative z-10 p-6'>

					{/* Decorative line */}
					<div className='relative my-4 h-0'>
						<div className='absolute left-0 right-0 top-0 h-px bg-[#154c5b] opacity-20' />
						{/* Decorative dots */}
						<div className='absolute left-0 right-0 top-[-6px] flex justify-between'>
							{[...Array(12)].map((_, i) => (
								<div
									key={i}
									className='w-[13px] h-[13px] bg-[#154c5b] rounded-full opacity-30'
								/>
							))}
						</div>
					</div>

					{/* Includes section */}
					<div className='mt-6'>
						<h3 className='josefin text-[36px] font-semibold text-[#154c5b] mb-4'>
							{t('includes')}
						</h3>

						{/* Benefits list */}
						<ul className='space-y-2'>
							{tier.benefits.map((benefit, index) => (
								<li
									key={index}
									className='flex items-start gap-3 josefin text-[24px] text-[#154c5b] leading-[40px]'
								>
									<Check
										className='w-6 h-6 text-[#7cbc97] flex-shrink-0 mt-1'
										strokeWidth={3}
									/>
									<span>{benefit}</span>
								</li>
							))}
						</ul>
					</div>

					{/* Buy button - show for all tiers */}
					<div className='mt-8'>
						<Link
							href={`/ticket/purchase/${tier.id}`}
							className='block bg-[#e2eee2] rounded-[12px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] py-4 px-8 text-center hover:opacity-90 transition-opacity'
						>
							<span className='josefin text-[32px] font-bold text-[#48715b]'>
								{t('buyTicket')}
							</span>
						</Link>
					</div>
				</div>
			</div>

			{/* Scroll decoration - footer */}
			<div className='relative w-full h-16 mt-0 z-20 ms-[-15%] mt-[-6%]'>
				<ScrollHeader />
			</div>
		</div>
	)
}

export default TicketTierCard


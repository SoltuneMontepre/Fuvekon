'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import CollapsibleScroll from '@/components/animated/CollapsibleScroll'
import { useGetMyTicket } from '@/hooks/services/ticket/useTicket'
import { useAuthStore } from '@/stores/authStore'
import type { TicketTier } from '@/types/models/ticket/ticket'
import Image from 'next/image'

// const TIER_IMAGES = [
// 	'/assets/hac.webp',
// 	'/assets/fg-flower.webp',
// 	'/assets/bg-dragon.webp',
// 	'/assets/mascot.webp',
// ]

const formatPrice = (price: number): string => {
	return new Intl.NumberFormat('vi-VN', {
		style: 'decimal',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

type TicketDisplayProps = {
	tiers: TicketTier[]
	onPurchase: (tierId: string) => void
	isPurchasing: boolean
}

const TicketDisplay = ({
	tiers,
	onPurchase,
	isPurchasing,
}: TicketDisplayProps) => {
	const router = useRouter()
	const t = useTranslations('ticket')
	const tCommon = useTranslations('common')
	const account = useAuthStore(state => state.account)
	const { data: myTicketData } = useGetMyTicket()

	const hasActiveTicket =
		myTicketData?.data && myTicketData.data.status !== 'denied'
	const isBlacklisted = account?.is_blacklisted
	const isDisabled = !account || !!isBlacklisted || !!hasActiveTicket

	const isTierClosed = (tier: TicketTier) => tier.is_active === false
	const isTierSoldOut = (tier: TicketTier) => tier.stock <= 0
	const getTierColor = (index: number) => {
		switch (index) {
			case 0:
				return 'bg-tier-1'
			case 1:
				return 'bg-tier-2'
			case 2:
				return 'bg-tier-3'
			case 3:
				return 'bg-tier-4'
			default:
				return 'bg-tier-1'
		}
	}

	return (
		<>
			{account && hasActiveTicket && (
				<div className='mb-6 text-center'>
					<p className='text-sm text-[#e2eee2] bg-black/40 backdrop-blur-sm inline-block px-5 py-2.5 rounded-xl'>
						{t('alreadyHaveTicket')}{' '}
						<button
							onClick={() => router.push('/account/ticket')}
							className='text-[#7cbc97] underline hover:no-underline font-medium'
						>
							{t('viewYourTicket')}
						</button>
					</p>
				</div>
			)}

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				{tiers.map((tier, index) => {
					const closed = isTierClosed(tier)
					const soldOut = isTierSoldOut(tier)
					const unavailable = closed || soldOut

					return (
						<CollapsibleScroll key={tier.id} initialOpen>
							<div
								className={`flex h-full flex-col ${unavailable ? 'opacity-100' : ''}`}
							>
								{/* Header — tier image as background */}
								<div
									className={`-mx-9 relative overflow-hidden ${getTierColor(index)}`}
								>
									<Image
										fill
										src='/textures/cloud.png'
										className='absolute inset-0 w-full h-full object-cover mix-blend-multiply grayscale opacity-[36%] scale-200'
										alt='Cloud texture background'
									/>
									<div className='absolute inset-0' />
									<div className='relative z-[1] px-3 py-3 text-center'>
										<h3 className='text-lg sm:text-xl font-bold lg:text-3xl text-text capitalize tracking-wide'>
											{tier.ticket_name.toLocaleLowerCase()}
										</h3>
										<p className='text-sm sm:text-base font-semibold text-text/90 josefin mt-0.5 tracking-wide'>
											{formatPrice(tier.price)} VN{'\u0110'}
										</p>
									</div>
								</div>

								{/* Description */}
								{tier.description && (
									<p className='text-xs text-text-secondary italic text-center mt-3 mb-1'>
										{tier.description}
									</p>
								)}

								{/* Benefits */}
								{tier.benefits && tier.benefits.length > 0 && (
									<ul className='space-y-2 px-1 py-2 flex-1'>
										{tier.benefits.map((benefit, i) => (
											<li key={i} className='flex items-start gap-2 min-w-0'>
												<Check
													className='w-3.5 h-3.5 text-secondary flex-shrink-0 mt-0.5'
													strokeWidth={3}
												/>
												<span className='text-xs text-text-primary leading-relaxed break-words min-w-0'>
													{benefit}
												</span>
											</li>
										))}
									</ul>
								)}

								{/* Stock warning + Buy button pinned to bottom */}
								<div className='mt-auto'>
									{(soldOut ||
										(!closed && tier.stock > 0 && tier.stock < 10)) && (
										<p
											className={`text-center text-xs font-semibold tracking-wide uppercase py-1 ${
												soldOut ? 'text-red-500' : 'text-[#c97b2a]'
											}`}
										>
											{soldOut ? t('soldOut') : t('runningOut')}
										</p>
									)}

									<div className='py-3 px-1'>
										<button
											onClick={() => !unavailable && onPurchase(tier.id)}
											disabled={isDisabled || unavailable || isPurchasing}
											className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-200 josefin ${
												soldOut
													? 'bg-[#d4738a]/20 text-[#c25670] cursor-not-allowed'
													: isDisabled || unavailable || isPurchasing
														? 'bg-secondary/15 text-[#8C8C8C] cursor-not-allowed'
														: 'bg-secondary text-[#e2eee2] hover:bg-[#3d6d65] active:scale-[0.97] shadow-lg shadow-secondary/30'
											}`}
										>
											{isPurchasing
												? tCommon('processing')
												: soldOut
													? t('soldOut') + '!!!'
													: closed
														? t('closed')
														: isDisabled && hasActiveTicket
															? t('alreadyHaveTicket')
															: t('buyNow')}
										</button>
									</div>
								</div>
							</div>
						</CollapsibleScroll>
					)
				})}
			</div>
		</>
	)
}

export default TicketDisplay

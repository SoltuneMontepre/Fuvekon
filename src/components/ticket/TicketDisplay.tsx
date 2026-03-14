'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import CollapsibleScroll from '@/components/animated/CollapsibleScroll'
import { useGetMyTicket } from '@/hooks/services/ticket/useTicket'
import { useAuthStore } from '@/stores/authStore'
import type { TicketTier } from '@/types/models/ticket/ticket'

const SERIF = '"Times New Roman", Times, Baskerville, Georgia, serif'

const formatPrice = (price: number): string => {
	return new Intl.NumberFormat('vi-VN', {
		style: 'decimal',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

// ── Tier visual config by price rank (0 = cheapest … 3 = most expensive) ──
interface TierColor {
	bannerBg: string
	titleColor: string
	titleShadow?: string
	priceColor: string
	priceShadow?: string
	checkColor: string
	checkMark: string
	btnBg: string
	btnColor: string
	btnBorder?: string
	btnShadow: string
}

const TIER_COLORS: TierColor[] = [
	{
		// Tier 1 — dark teal charcoal
		bannerBg: '#2d3c3f',
		titleColor: '#FFFFFF',
		priceColor: '#FFFFFF',
		checkColor: '#8B6E3A',
		checkMark: '◈',
		btnBg: 'linear-gradient(160deg, #3d5558 0%, #2d3c3f 100%)',
		btnColor: '#c8e0e4',
		btnShadow: '0 3px 14px rgba(0,0,0,0.3)',
	},
	{
		// Tier 2 — silver grey
		bannerBg: '#979591',
		titleColor: '#FFFFFF',
		priceColor: '#FFFFFF',
		checkColor: '#2c7a60',
		checkMark: '✦',
		btnBg: 'linear-gradient(160deg, #aaa8a4 0%, #797673 100%)',
		btnColor: '#ffffff',
		btnShadow: '0 3px 14px rgba(0,0,0,0.3)',
	},
	{
		// Tier 3 — warm gold
		bannerBg: '#b99b59',
		titleColor: '#FFFFFF',
		priceColor: '#FFFFFF',
		checkColor: '#c9a030',
		checkMark: '❖',
		btnBg: 'linear-gradient(160deg, #c9aa65 0%, #9e7e3f 100%)',
		btnColor: '#ffffff',
		btnShadow: '0 3px 16px rgba(0,0,0,0.3)',
	},
	{
		// Tier 4 — purple
		bannerBg: '#a26dbd',
		titleColor: '#f5d060',
		titleShadow: '0 0 20px rgba(240,200,80,0.5)',
		priceColor: '#f5d060',
		priceShadow: '0 0 12px rgba(240,200,80,0.4)',
		checkColor: '#c9a030',
		checkMark: '♛',
		btnBg: 'linear-gradient(160deg, #b87fd4 0%, #8a4fa8 50%, #7a3d99 100%)',
		btnColor: '#f5e6ff',
		btnBorder: '1px solid rgba(200,150,230,0.5)',
		btnShadow: '0 3px 18px rgba(0,0,0,0.4), 0 0 14px rgba(162,109,189,0.35)',
	},
]

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
	const isDisabled = !!isBlacklisted || !!hasActiveTicket

	const isTierClosed = (tier: TicketTier) => !tier.is_active
	const isTierSoldOut = (tier: TicketTier) => tier.stock <= 0

	// Map tier id → visual rank by price (0 = cheapest … n-1 = most expensive)
	const tierRankMap = new Map(
		[...tiers].sort((a, b) => Number(a.price) - Number(b.price)).map((t, i) => [t.id, i])
	)

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

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch'>
				{tiers.map((tier) => {
					const rank = Math.min(tierRankMap.get(tier.id) ?? 0, TIER_COLORS.length - 1)
					const colors = TIER_COLORS[rank]
					const isTop = rank === TIER_COLORS.length - 1
					const closed = isTierClosed(tier)
					const soldOut = isTierSoldOut(tier)
					const unavailable = closed || soldOut

					return (
						<div
							key={tier.id}
							className='tier-card-hover transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] h-full'
						>
							<CollapsibleScroll initialOpen className='h-full'>
								<div className='flex flex-col h-full'>
									{/* Banner — solid tier colour + cloud texture overlay (same as main) */}
									<div
										className='-mx-9 relative overflow-hidden'
										style={{ backgroundColor: colors.bannerBg }}
									>
										<Image
											fill
											src='/textures/cloud.png'
											className='absolute inset-0 w-full h-full object-cover mix-blend-multiply grayscale opacity-[36%] scale-200'
											alt='Cloud texture background'
										/>

										{/* Imperial ribbon tag for top tier */}
										{isTop && (
											<div
												className='absolute top-0 right-4 z-10 font-bold'
												style={{
													fontFamily: SERIF,
													background: 'linear-gradient(160deg, #c9a030 0%, #f0c840 60%, #c9a030 100%)',
													color: '#1a0800',
													fontSize: '0.48rem',
													letterSpacing: '0.12em',
													padding: '5px 12px 8px',
													clipPath: 'polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)',
													boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
													lineHeight: 1,
												}}
											>
												{t('finest')}
											</div>
										)}

										<div className='relative z-[1] px-3 py-5 text-center'>
											<h3
												className={`font-bold uppercase tracking-[0.15em] ${isTop ? 'text-2xl drop-shadow-sm' : 'text-xl'}`}
												style={{
													fontFamily: SERIF,
													color: colors.titleColor,
													textShadow: colors.titleShadow || '0 1px 6px rgba(0,0,0,0.4)',
												}}
											>
												{tier.ticket_name}
											</h3>
											<p
												className='font-semibold mt-1.5 tracking-wide'
												style={{
													fontFamily: SERIF,
													fontSize: '18px',
													color: colors.priceColor,
													textShadow: colors.priceShadow,
												}}
											>
												{formatPrice(tier.price)} VN{'\u0110'}
											</p>
										</div>
									</div>

									{/* Description */}
									{tier.description && (
										<p
											className='text-sm italic text-center mt-3 mb-1'
											style={{ fontFamily: SERIF, color: 'rgba(80,55,25,0.65)' }}
										>
											— {tier.description} —
										</p>
									)}

									{/* Benefits — flex-1 so it expands to fill, keeping button pinned at bottom */}
									{tier.benefits && tier.benefits.length > 0 && (
										<ul className='px-1 py-2 flex-1'>
											{tier.benefits.map((benefit, i) => (
												<li
													key={i}
													className='flex items-start gap-2 min-w-0 py-1.5'
													style={{
														borderBottom: i < tier.benefits.length - 1
															? '1px solid rgba(0,0,0,0.055)'
															: 'none',
													}}
												>
													<span
														className='flex-shrink-0 mt-[3px] text-[0.7rem]'
														style={{ color: colors.checkColor }}
													>
														{colors.checkMark}
													</span>
													<span
														className='text-[15px] leading-relaxed break-words min-w-0'
														style={{ fontFamily: SERIF, color: '#2e1e08' }}
													>
														{benefit}
													</span>
												</li>
											))}
										</ul>
									)}

									{/* Stock warning */}
									{(soldOut || (!closed && tier.stock > 0 && tier.stock < 10)) && (
										<p className={`text-center text-xs font-semibold tracking-wide uppercase py-1 ${
											soldOut ? 'text-red-500' : 'text-[#c97b2a]'
										}`}>
											{soldOut ? t('soldOut') : t('runningOut')}
										</p>
									)}

									{/* Buy button — mt-auto pins to bottom */}
									<div className='mt-auto py-3 px-1'>
										<button
											onClick={() => {
												if (!account) {
													router.push('/login')
													return
												}
												if (!unavailable) onPurchase(tier.id)
											}}
											disabled={isDisabled || unavailable || isPurchasing}
											className='w-full py-2.5 px-4 rounded-[6px] font-bold text-sm uppercase tracking-[0.18em] transition-all duration-200 relative overflow-hidden'
											style={{
												fontFamily: SERIF,
												background: soldOut
													? 'rgba(212,115,138,0.2)'
													: isDisabled || unavailable || isPurchasing
														? 'rgba(140,140,140,0.15)'
														: colors.btnBg,
												color: soldOut
													? '#c25670'
													: isDisabled || unavailable || isPurchasing
														? '#8C8C8C'
														: colors.btnColor,
												border: soldOut || isDisabled || unavailable || isPurchasing
													? 'none'
													: colors.btnBorder || 'none',
												boxShadow: soldOut || isDisabled || unavailable || isPurchasing
													? 'none'
													: colors.btnShadow,
												cursor: isDisabled || unavailable || isPurchasing
													? 'not-allowed'
													: 'pointer',
											}}
										>
											{/* Glass highlight */}
											<span
												className='absolute inset-0 pointer-events-none'
												style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 55%)' }}
											/>
											<span className='relative z-[1]'>
												{isPurchasing
													? tCommon('processing')
													: soldOut
														? t('soldOut') + '!!!'
														: closed
															? t('closed')
															: !account
																? t('loginNow')
																: isDisabled && hasActiveTicket
																	? t('alreadyHaveTicket')
																	: isTop
																		? `✦ ${t('buyNow')} ✦`
																		: t('buyNow')}
											</span>
										</button>
									</div>
								</div>
							</CollapsibleScroll>
						</div>
					)
				})}
			</div>

			{/* Hover glow effect */}
			<style jsx global>{`
				.tier-card-hover {
					filter: drop-shadow(0 8px 24px rgba(0,0,0,0.45));
				}
				.tier-card-hover:hover {
					transform: translateY(-6px);
					filter: drop-shadow(0 16px 36px rgba(0,0,0,0.6)) drop-shadow(0 0 20px rgba(201,168,76,0.15));
				}
			`}</style>
		</>
	)
}

export default TicketDisplay

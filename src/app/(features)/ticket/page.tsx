'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import CollapsibleScroll from '@/components/animated/CollapsibleScroll'
import {
	useGetTiers,
	useGetMyTicket,
	usePurchaseTicket,
} from '@/hooks/services/ticket/useTicket'
import { useAuthStore } from '@/stores/authStore'
import Background from '@/components/ui/Background'
import type { TicketTier } from '@/types/models/ticket/ticket'
import Loading from '@/components/common/Loading'

const formatPrice = (price: number): string => {
	return new Intl.NumberFormat('vi-VN', {
		style: 'decimal',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

// Decorative watermark image per tier (all used elsewhere in the codebase)
const TIER_IMAGES = [
	'/assets/hac.webp',
	'/assets/fg-flower.webp',
	'/assets/bg-dragon.webp',
	'/assets/mascot.webp',
]

const SERIF = '"Times New Roman", Times, Baskerville, Georgia, serif'

// ── Tier visual config by price rank (0 = cheapest … 3 = most expensive) ──
// Teal-green banners with tier-specific accent differentiation.
interface TierColor {
	bannerGradient: string
	bannerBorder: string
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
		// Bronze / Bamboo — earthy green banner, bronze accents
		bannerGradient: 'linear-gradient(160deg, #558a72 0%, #3d6e5a 50%, #336055 100%)',
		bannerBorder: '2px solid rgba(130,180,120,0.35)',
		titleColor: '#FFFFFF',
		priceColor: '#e8b860',
		checkColor: '#8B6E3A',
		checkMark: '◈',
		btnBg: 'linear-gradient(160deg, #558a72 0%, #3d6e5a 100%)',
		btnColor: '#d4f0e0',
		btnShadow: '0 3px 14px rgba(0,0,0,0.3)',
	},
	{
		// Jade / Lotus — teal banner, jade-green accents
		bannerGradient: 'linear-gradient(160deg, #3e9890 0%, #2e8080 50%, #246e6a 100%)',
		bannerBorder: '2px solid rgba(100,210,190,0.3)',
		titleColor: '#FFFFFF',
		priceColor: '#f0c84a',
		checkColor: '#2c7a60',
		checkMark: '✦',
		btnBg: 'linear-gradient(160deg, #3e9890 0%, #2a7878 100%)',
		btnColor: '#b0ede0',
		btnShadow: '0 3px 14px rgba(0,0,0,0.3)',
	},
	{
		// Phoenix — deep navy-teal banner, warm gold-amber accents
		bannerGradient: 'linear-gradient(160deg, #1a4a5a 0%, #153d4d 40%, #0e2e3a 100%)',
		bannerBorder: '2px solid rgba(220,170,60,0.45)',
		titleColor: '#FFFFFF',
		priceColor: '#f0c840',
		priceShadow: '0 0 10px rgba(201,146,42,0.3)',
		checkColor: '#c9a030',
		checkMark: '❖',
		btnBg: 'linear-gradient(160deg, #1a4a5a 0%, #153d4d 100%)',
		btnColor: '#f0dca0',
		btnShadow: '0 3px 16px rgba(0,0,0,0.35)',
	},
	{
		// Imperial / Dragon — dark warm banner, prominent gold accents + glow
		bannerGradient: 'linear-gradient(160deg, #2e1e10 0%, #3a2a14 40%, #2a1a0a 100%)',
		bannerBorder: '2px solid rgba(220,180,60,0.65)',
		titleColor: '#f5d060',
		titleShadow: '0 0 20px rgba(240,200,80,0.5)',
		priceColor: '#f5d060',
		priceShadow: '0 0 12px rgba(240,200,80,0.4)',
		checkColor: '#c9a030',
		checkMark: '♛',
		btnBg: 'linear-gradient(160deg, #5a4a20 0%, #7a5e28 50%, #5a4a20 100%)',
		btnColor: '#f5e6b8',
		btnBorder: '1px solid rgba(201,168,76,0.6)',
		btnShadow: '0 3px 18px rgba(0,0,0,0.4), 0 0 14px rgba(201,168,76,0.25)',
	},
]

const TicketPage = (): React.ReactElement => {
	const router = useRouter()
	const t = useTranslations('ticket')
	const account = useAuthStore(state => state.account)

	const {
		data: tiersData,
		isLoading: tiersLoading,
		error: tiersError,
	} = useGetTiers()
	const { data: myTicketData, isLoading: ticketLoading } = useGetMyTicket(!!account)
	const purchaseMutation = usePurchaseTicket()
	const [isPurchasing, setIsPurchasing] = useState(false)

	const hasActiveTicket =
		myTicketData?.data && myTicketData.data.status !== 'denied'
	const isBlacklisted = account?.is_blacklisted

	const handlePurchase = async (tierId: string) => {
		if (!account) {
			router.push('/login')
			return
		}

		setIsPurchasing(true)
		try {
			const result = await purchaseMutation.mutateAsync(tierId)
			if (result?.isSuccess) {
				const queued = result?.statusCode === 202
				// Keep loading up — it will stay until the new page mounts
				router.push(queued ? `/ticket/purchase/${tierId}?queued=1` : `/ticket/purchase/${tierId}`)
				return
			}
			setIsPurchasing(false)
		} catch (err) {
			const message =
				(err as AxiosError<{ message?: string }>)?.response?.data?.message ||
				(err as Error).message ||
				t('errorOccurred')
			toast.error(message)
			setIsPurchasing(false)
		}
	}

	const isDisabled = !!isBlacklisted || !!hasActiveTicket
	const isTierClosed = (tier: TicketTier) => tier.is_active === false
	const isTierSoldOut = (tier: TicketTier) => tier.stock <= 0

	const purchaseNotices = [
		t('notice1'),
		t('notice2'),
		t('notice3'),
		t('notice4'),
		t('notice5'),
		t('notice6'),
	]

	if (tiersLoading || ticketLoading) {
		return <Loading />
	}

	if (tiersError) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-red-600 text-xl'>{t('errorOccurred')}</div>
			</div>
		)
	}

	const tiers: TicketTier[] = tiersData?.data ?? []

	// Map tier id → visual rank (0 = cheapest … n-1 = most expensive)
	const tierRankMap = new Map(
		[...tiers].sort((a, b) => Number(a.price) - Number(b.price)).map((t, i) => [t.id, i])
	)

	return (
		<>
			{isPurchasing && <Loading />}
			<Background />
			<div className='fixed inset-0 z-[1] bg-black/40' />
			<div className='min-h-screen relative z-10 py-12 px-4'>
				<div className='max-w-7xl mx-auto relative z-20'>

					{/* ── Page Header with ornamental divider ── */}
					<div className='text-center mb-10'>
						<div className='flex items-center justify-center gap-3 mb-3'>
							<div className='w-[60px] h-px' style={{ background: 'linear-gradient(to left, transparent, #c9a84c)' }} />
							<svg width='28' height='14' viewBox='0 0 28 14'>
								<path d='M14 1 L27 7 L14 13 L1 7 Z' stroke='#c9a84c' strokeWidth='1' fill='rgba(201,168,76,0.15)' />
								<circle cx='14' cy='7' r='2.5' fill='#c9a84c' />
							</svg>
							<div className='w-[60px] h-px' style={{ background: 'linear-gradient(to right, transparent, #c9a84c)' }} />
						</div>
						<h1
							className='font-bold uppercase tracking-[0.18em] mb-1.5'
							style={{
								fontFamily: SERIF,
								fontSize: 'clamp(1.3rem, 2.5vw, 2rem)',
								color: '#f0d080',
								textShadow: '0 2px 20px rgba(201,168,76,0.45), 0 0 60px rgba(201,168,76,0.2)',
							}}
						>
							{t('purchaseTitle')}
						</h1>
						<p
							className='italic text-base tracking-[0.15em]'
							style={{ fontFamily: SERIF, color: 'rgba(220,200,140,0.6)' }}
						>
							{t('selectTier')}
						</p>
					</div>

					{/* Status messages */}
					{!account && (
						<div className='mb-6 text-center'>
							<p className='text-sm text-[#e2eee2] bg-black/40 backdrop-blur-sm inline-block px-5 py-2.5 rounded-xl'>
								{t('loginToBuy')}{' '}
								<button
									onClick={() => router.push('/login')}
									className='text-white underline hover:no-underline font-medium'
								>
									{t('loginNow')}
								</button>
							</p>
						</div>
					)}

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

					{account && isBlacklisted && (
						<div className='mb-6 text-center'>
							<p className='text-sm text-red-300 bg-black/40 backdrop-blur-sm inline-block px-5 py-2.5 rounded-xl'>
								{t('accountRestricted')}
							</p>
						</div>
					)}

					{/* Tier Cards — 4 columns */}
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start'>
						{tiers.map((tier, index) => {
							const rank = Math.min(tierRankMap.get(tier.id) ?? 0, TIER_COLORS.length - 1)
							const colors = TIER_COLORS[rank]
							const isTop = rank === TIER_COLORS.length - 1
							const closed = isTierClosed(tier)
							const soldOut = isTierSoldOut(tier)
							const unavailable = closed || soldOut
							const tierImage = TIER_IMAGES[index % TIER_IMAGES.length]

							return (
								<div
									key={tier.id}
									className='tier-card-hover transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]'
								>
								<CollapsibleScroll
								initialOpen
							>
									<div className='flex flex-col'>
										{/* Header — tier image as background with teal gradient overlay */}
										<div
											className='-mx-9 relative overflow-hidden'
											style={{
												backgroundImage: `url(${tierImage})`,
												backgroundSize: 'cover',
												backgroundPosition: 'center',
											}}
										>
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
											{/* Teal gradient overlay — tier-specific */}
											<div
												className='absolute inset-0'
												style={{ background: colors.bannerGradient, opacity: 0.88 }}
											/>
											{/* Border accents on sides */}
											<div
												className='absolute inset-y-0 left-0'
												style={{ borderLeft: colors.bannerBorder }}
											/>
											<div
												className='absolute inset-y-0 right-0'
												style={{ borderRight: colors.bannerBorder }}
											/>
											{/* Diagonal light sweep */}
											<div
												className='absolute inset-0 pointer-events-none'
												style={{ background: 'linear-gradient(125deg, rgba(255,255,255,0.07) 0%, transparent 55%)' }}
											/>

											<div className='relative z-[1] px-3 py-5 text-center'>
												<h3
													className={`font-bold uppercase tracking-[0.15em] ${isTop ? 'text-2xl drop-shadow-sm' : 'text-xl'}`}
													style={{
														color: colors.titleColor,
														fontFamily: SERIF,
														textShadow: colors.titleShadow || '0 1px 6px rgba(0,0,0,0.4)',
													}}
												>
													{tier.ticket_name}
												</h3>
												<p
													className='font-semibold mt-1.5 tracking-wide'
													style={{
														color: colors.priceColor,
														fontFamily: SERIF,
														fontSize: '18px',
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

										{/* Benefits */}
										{tier.benefits && tier.benefits.length > 0 && (
											<ul className='px-1 py-2'>
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

										{/* Buy button — tier-specific gradient */}
										<div className='mt-auto py-3 px-1'>
											<button
												onClick={() => !unavailable && handlePurchase(tier.id)}
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
												{/* Glass highlight on button */}
												<span
													className='absolute inset-0 pointer-events-none'
													style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 55%)' }}
												/>
												<span className='relative z-[1]'>
													{soldOut
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

					{tiers.length === 0 && (
						<div className='text-center py-12'>
							<p className='text-[#e2eee2] text-lg bg-black/40 backdrop-blur-sm inline-block px-5 py-2.5 rounded-xl'>
								{t('noTiersAvailable')}
							</p>
						</div>
					)}

					{/* Purchase Notices */}
					<div className='mt-8 max-w-2xl mx-auto'>
						<CollapsibleScroll initialOpen className='drop-shadow-xl'>
							{/* Header with image background */}
							<div
								className='-mx-9 relative overflow-hidden'
								style={{
									backgroundImage: 'url(/assets/common/drum_pattern.webp)',
									backgroundSize: 'cover',
									backgroundPosition: 'center',
								}}
							>
								<div className='absolute inset-0 bg-secondary/90' />
								<div className='relative z-[1] px-4 py-4 text-center'>
									<h3
										className='text-[22px] font-bold uppercase tracking-[0.15em]'
										style={{
											fontFamily: SERIF,
											color: '#F0C060',
											textShadow: '0 1px 8px rgba(0,0,0,0.5), 0 0 20px rgba(201,146,42,0.3)',
										}}
									>
										{t('purchaseNoticesTitle')}
									</h3>
								</div>
							</div>

							<div className='px-2 py-4'>
								<ol className='space-y-2 list-decimal list-inside'>
									{purchaseNotices.map((notice, i) => (
										<li key={i} className='text-base leading-relaxed text-[#2B2B2B]' style={{ fontFamily: SERIF }}>
											{notice}
										</li>
									))}
								</ol>
							</div>
							<div className='pb-1' />
						</CollapsibleScroll>
					</div>
				</div>
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

export default TicketPage

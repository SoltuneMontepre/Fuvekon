'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
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
	// Imperial Vietnamese palette — same white titles + saffron prices across all tiers;
	// overlay depth and shadow color provide the Wood→Bronze→Silver→Gold differentiation.
	const TIER_COLORS = [
		// Wood
		{ title: '#FFFFFF', price: '#EB9F4F', overlayOpacity: 0.78, shadow: '#8B5E3C' },
		// Bronze
		{ title: '#FFFFFF', price: '#EB9F4F', overlayOpacity: 0.82, shadow: '#CD7F32' },
		// Silver
		{ title: '#FFFFFF', price: '#EB9F4F', overlayOpacity: 0.85, shadow: '#A8A8A8' },
		// Gold
		{ title: '#FFFFFF', price: '#EB9F4F', overlayOpacity: 0.88, shadow: '#D4AF37' },
	]
	const SERIF = '"Times New Roman", Times, Baskerville, Georgia, serif'

	return (
		<>
			{isPurchasing && <Loading />}
			<Background />
			<div className='fixed inset-0 z-[1] bg-black/40' />
			<div className='min-h-screen relative z-10 py-12 px-4'>
				<div className='max-w-7xl mx-auto relative z-20'>
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
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
						{tiers.map((tier, index) => {
							const rank = Math.min(tierRankMap.get(tier.id) ?? 0, TIER_COLORS.length - 1)
							const colors = TIER_COLORS[rank]
							const isTop = rank === TIER_COLORS.length - 1
							const closed = isTierClosed(tier)
							const soldOut = isTierSoldOut(tier)
							const unavailable = closed || soldOut
							const tierImage = TIER_IMAGES[index % TIER_IMAGES.length]

							return (
								<CollapsibleScroll
								key={tier.id}
								initialOpen
							>
									<div className='flex flex-col'>
										{/* Header — tier image as background */}
										<div
											className='-mx-9 relative overflow-hidden'
											style={{
												backgroundImage: `url(${tierImage})`,
												backgroundSize: 'cover',
												backgroundPosition: 'center',
											}}
										>
											{/* Dark overlay — opacity scales with tier rank */}
											<div
												className='absolute inset-0'
												style={{ background: 'linear-gradient(180deg, #004D54 0%, #00363A 100%)', opacity: colors.overlayOpacity }}
											/>
											<div className='relative z-[1] px-3 py-4 text-center'>
												<h3
													className={`font-bold uppercase tracking-wide ${isTop ? 'text-2xl drop-shadow-sm' : 'text-xl'}`}
													style={{ color: colors.title, fontFamily: SERIF }}
												>
													{tier.ticket_name}
												</h3>
												<p
													className='font-semibold mt-1 tracking-wide text-[18px]'
													style={{ color: colors.price, fontFamily: SERIF, fontSize: '18px' }}
												>
													{formatPrice(tier.price)} VN{'\u0110'}
												</p>
											</div>
										</div>

										{/* Description */}
										{tier.description && (
											<p className='text-sm italic text-center mt-3 mb-1 text-[#5A5A5A]' style={{ fontFamily: SERIF }}>
												{tier.description}
											</p>
										)}

										{/* Benefits */}
										{tier.benefits && tier.benefits.length > 0 && (
											<ul className='space-y-2 px-1 py-2'>
												{tier.benefits.map((benefit, i) => (
													<li key={i} className='flex items-start gap-2 min-w-0'>
														<Check
															className='w-3.5 h-3.5 flex-shrink-0 mt-0.5'
															style={{ color: '#EB9F4F' }}
															strokeWidth={3}
														/>
														<span className='text-[15px] leading-relaxed break-words min-w-0 text-[#2B2B2B]' style={{ fontFamily: SERIF }}>
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

										{/* Buy button */}
										<div className='mt-auto py-3 px-1'>
											<button
												onClick={() => !unavailable && handlePurchase(tier.id)}
												disabled={isDisabled || unavailable || isPurchasing}
												className={`w-full py-2.5 px-4 rounded-xl font-bold text-base uppercase tracking-widest transition-all duration-200 ${
													soldOut
														? 'bg-[#d4738a]/20 text-[#c25670] cursor-not-allowed'
														: isDisabled || unavailable || isPurchasing
															? 'bg-secondary/15 text-[#8C8C8C] cursor-not-allowed'
															: 'btn-primary active:scale-[0.97]'
												}`}
											>
												{soldOut
													? t('soldOut') + '!!!'
													: closed
													? t('closed')
													: !account
													? t('loginNow')
													: isDisabled && hasActiveTicket
													? t('alreadyHaveTicket')
													: t('buyNow')}
											</button>
										</div>
									</div>
								</CollapsibleScroll>
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
								<div className='absolute inset-0 bg-secondary/70' />
								<div className='relative z-[1] px-4 py-3 text-center'>
									<h3 className='text-[22px] font-bold uppercase tracking-wide text-[#D4AF37]' style={{ fontFamily: SERIF }}>
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
		</>
	)
}

export default TicketPage

'use client'

import React from 'react'
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
	const tCommon = useTranslations('common')
	const account = useAuthStore(state => state.account)

	const {
		data: tiersData,
		isLoading: tiersLoading,
		error: tiersError,
	} = useGetTiers()
	const { data: myTicketData, isLoading: ticketLoading } = useGetMyTicket()
	const purchaseMutation = usePurchaseTicket()

	const hasActiveTicket =
		myTicketData?.data && myTicketData.data.status !== 'denied'
	const isBlacklisted = account?.is_blacklisted

	const handlePurchase = async (tierId: string) => {
		if (!account) {
			router.push('/login')
			return
		}

		try {
			const result = await purchaseMutation.mutateAsync(tierId)
			if (result?.isSuccess) {
				router.push(`/ticket/purchase/${tierId}`)
			}
		} catch (err) {
			const message =
				(err as AxiosError<{ message?: string }>)?.response?.data?.message ||
				(err as Error).message ||
				t('errorOccurred')
			toast.error(message)
		}
	}

	const isDisabled = !account || !!isBlacklisted || !!hasActiveTicket
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

	return (
		<>
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
									className='text-[#7cbc97] underline hover:no-underline font-medium'
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
							const closed = isTierClosed(tier)
							const soldOut = isTierSoldOut(tier)
							const unavailable = closed || soldOut
							const tierImage = TIER_IMAGES[index % TIER_IMAGES.length]

							return (
								<CollapsibleScroll key={tier.id} initialOpen>
									<div className={unavailable ? 'opacity-100' : ''}>
										{/* Header — tier image as background */}
										<div
											className='-mx-9 relative overflow-hidden'
											style={{
												opacity: `100%`,
												backgroundImage: `url(${tierImage})`,
												backgroundSize: 'cover',
												backgroundPosition: 'center',
											}}
										>
											{/* Dark overlay for text readability */}
											<div className='absolute inset-0 bg-secondary/70' />
											<div className='relative z-[1] px-3 py-3 text-center'>
												<h3 className='text-lg sm:text-xl lg:text-2xl font-bold text-[#e2eee2] josefin uppercase tracking-wide'>
													{tier.ticket_name}
												</h3>
												<p className='text-sm sm:text-base font-semibold text-[#e2eee2]/90 josefin mt-0.5 tracking-wide'>
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
											<ul className='space-y-2 px-1 py-2'>
												{tier.benefits.map((benefit, i) => (
													<li key={i} className='flex items-start gap-2 min-w-0'>
														<Check className='w-3.5 h-3.5 text-secondary flex-shrink-0 mt-0.5' strokeWidth={3} />
														<span className='text-xs text-text-primary leading-relaxed break-words min-w-0'>
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
										<div className='py-3 px-1'>
											<button
												onClick={() => !unavailable && handlePurchase(tier.id)}
												disabled={isDisabled || unavailable || purchaseMutation.isPending}
												className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-200 josefin ${
													soldOut
														? 'bg-[#d4738a]/20 text-[#c25670] cursor-not-allowed'
														: isDisabled || unavailable || purchaseMutation.isPending
															? 'bg-secondary/15 text-[#8C8C8C] cursor-not-allowed'
															: 'bg-secondary text-[#e2eee2] hover:bg-[#3d6d65] active:scale-[0.97] shadow-lg shadow-secondary/30'
												}`}
											>
												{purchaseMutation.isPending
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
					<div className='mt-8 max-w-3xl mx-auto'>
						<CollapsibleScroll initialOpen>
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
									<h3 className='text-lg sm:text-xl font-bold text-[#e2eee2] josefin uppercase tracking-wide'>
										{t('purchaseNoticesTitle')}
									</h3>
								</div>
							</div>

							<div className='px-2 py-3'>
								<p className='text-text-secondary leading-relaxed text-xs sm:text-[13px]'>
									{purchaseNotices.join(' ')}
								</p>
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

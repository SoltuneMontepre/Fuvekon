'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import { AxiosError } from 'axios'
import CollapsibleScroll from '@/components/animated/CollapsibleScroll'
import Separator from '@/components/common/scroll/Separator'
import {
	useGetTiers,
	useGetMyTicket,
	usePurchaseTicket,
} from '@/hooks/services/ticket/useTicket'
import { useAuthStore } from '@/stores/authStore'
import Background from '@/components/ui/Background'
import type { TicketTier } from '@/types/models/ticket/ticket'
import Loading from '@/components/common/Loading'

// Format price in VND
const formatPrice = (price: number): string => {
	return new Intl.NumberFormat('vi-VN', {
		style: 'decimal',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}


const TicketPage = (): React.ReactElement => {
	const router = useRouter()
	const t = useTranslations('ticket')
	const tCommon = useTranslations('common')
	const account = useAuthStore(state => state.account)

	// Fetch tiers and user's current ticket
	const {
		data: tiersData,
		isLoading: tiersLoading,
		error: tiersError,
	} = useGetTiers()
	const { data: myTicketData, isLoading: ticketLoading } = useGetMyTicket()
	const purchaseMutation = usePurchaseTicket()

	// Check if user already has a non-denied ticket
	const hasActiveTicket =
		myTicketData?.data && myTicketData.data.status !== 'denied'

	// Check if user is blacklisted
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
		} catch {
			// Error is handled by mutation
		}
	}

	const isDisabled = !account || isBlacklisted || hasActiveTicket
	const isTierClosed = (tier: TicketTier) => tier.is_active === false

	// Purchase notices
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
			<div className='min-h-screen relative z-10 py-12 px-4'>
				<div className='max-w-7xl mx-auto'>
					{/* 3 Scrolls Side by Side */}
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						{tiers.map(tier => {
							const closed = isTierClosed(tier)
							return (
								<CollapsibleScroll key={tier.id} initialOpen>
									{/* Tier Header */}
									<div
										className={`px-4 py-4 text-center ${closed ? 'bg-[#548780]/70' : 'bg-[#548780]'}`}
									>
										<div className='flex items-center justify-center gap-2 flex-wrap'>
											<h3
												className={`text-2xl font-bold josefin italic ${closed ? 'text-[#e2eee2]/80' : 'text-[#e2eee2]'}`}
											>
												{tier.ticket_name}
											</h3>
											{closed && (
												<span className='px-2 py-0.5 rounded text-xs font-semibold uppercase bg-[#e2eee2]/20 text-[#e2eee2]'>
													{t('closed')}
												</span>
											)}
										</div>
										<div className={`text-lg mt-1 ${closed ? 'text-[#e2eee2]/80' : 'text-[#e2eee2]'}`}>
											{formatPrice(tier.price)} VND
										</div>
									</div>

									{/* Benefits List */}
									<div className={`px-4 py-4 ${closed ? 'opacity-75' : ''}`}>
										{tier.benefits && tier.benefits.length > 0 && (
											<>
												<p className='text-sm text-[#48715b] font-medium mb-3'>
													{t('ticketIncludes')}:
												</p>
												<ul className='space-y-2'>
													{tier.benefits.map((benefit, index) => (
														<li key={index} className='flex items-start gap-2'>
															<Check className='w-4 h-4 text-[#7cbc97] flex-shrink-0 mt-0.5' />
															<span className='text-sm text-[#154c5b] break-all'>
																{benefit}
															</span>
														</li>
													))}
												</ul>
											</>
										)}

										{/* Buy Button for this tier */}
										<div className='mt-6'>
											<button
												onClick={() => !closed && handlePurchase(tier.id)}
												disabled={isDisabled || closed || purchaseMutation.isPending}
												className={`
													w-full py-3 px-6 rounded-lg font-semibold text-lg uppercase tracking-wide
													transition-all duration-200
													shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
													${
														isDisabled || closed || purchaseMutation.isPending
															? 'bg-gray-300 text-gray-500 cursor-not-allowed'
															: 'bg-[#e8f0e8] text-[#48715b] hover:bg-[#d8e8d8] active:translate-y-0.5'
													}
												`}
											>
												{purchaseMutation.isPending
													? tCommon('processing')
													: closed
														? t('closed')
														: `${t('buyNow')} !!`}
											</button>
										</div>
									</div>

									<div className='pb-3' />
								</CollapsibleScroll>
							)
						})}
					</div>

					{tiers.length === 0 && (
						<div className='text-center py-12'>
							<p className='text-[#48715b] text-lg'>{t('noTiersAvailable')}</p>
						</div>
					)}

					{/* Status messages */}
					{!account && (
						<div className='mt-6 text-center'>
							<p className='text-sm text-yellow-200'>
								{t('loginToBuy')}{' '}
								<button
									onClick={() => router.push('/login')}
									className='text-[#7cbc97] underline hover:no-underline'
								>
									{t('loginNow')}
								</button>
							</p>
						</div>
					)}

					{account && hasActiveTicket && (
						<div className='mt-6 text-center'>
							<p className='text-sm text-blue-200'>
								{t('alreadyHaveTicket')}{' '}
								<button
									onClick={() => router.push('/account')}
									className='text-[#7cbc97] underline hover:no-underline'
								>
									{t('viewYourTicket')}
								</button>
							</p>
						</div>
					)}

					{account && isBlacklisted && (
						<div className='mt-6 text-center'>
							<p className='text-sm text-red-300'>{t('accountRestricted')}</p>
						</div>
					)}

					{purchaseMutation.error && (
						<div className='mt-6 text-center'>
							<p className='text-sm text-red-300'>
								{(purchaseMutation.error as AxiosError<{ message?: string }>)
									?.response?.data?.message ||
									(purchaseMutation.error as Error).message ||
									t('errorOccurred')}
							</p>
						</div>
					)}

					{/* Purchase Notices Scroll */}
					<div className='mt-8'>
						<CollapsibleScroll initialOpen>
							<h3 className="scroll-title pt-5 josefin bg-[url('/textures/asfalt-dark.png')] bg-scroll-title bg-clip-text text-transparent">
								{t('purchaseNoticesTitle')}
							</h3>
							<Separator className='w-[95%] mx-auto' />
							<div className='text-scroll-text text-md font-sm px-4 py-4'>
								<p className='text-[#48715b] leading-relaxed'>
									{purchaseNotices.join(' ')}
								</p>
							</div>
							<div className='pb-5' />
						</CollapsibleScroll>
					</div>
				</div>
			</div>
		</>
	)
}

export default TicketPage

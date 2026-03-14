'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import CollapsibleScroll from '@/components/animated/CollapsibleScroll'
import TicketDisplay from '@/components/ticket/TicketDisplay'
import {
	useGetTiers,
	usePurchaseTicket,
} from '@/hooks/services/ticket/useTicket'
import { useAuthStore } from '@/stores/authStore'
import Background from '@/components/ui/Background'
import Loading from '@/components/common/Loading'
import { AlertCircle } from 'lucide-react'
import type { TicketTier } from '@/types/models/ticket/ticket'

const SERIF = '"Times New Roman", Times, Baskerville, Georgia, serif'


const TicketPage = (): React.ReactElement => {
	const router = useRouter()
	const t = useTranslations('ticket')
	const account = useAuthStore(state => state.account)

	const {
		data: tiersData,
		isLoading: tiersLoading,
		error: tiersError,
	} = useGetTiers()
	const purchaseMutation = usePurchaseTicket()
	const [isPurchasing, setIsPurchasing] = useState(false)

	const isBlacklisted = account?.is_blacklisted
	const [showTicketNotAvailable, setShowTicketNotAvailable] = useState(false)

	const handlePurchase = async (tierId: string) => {
		if (!account) {
			router.push('/login')
			return
		}
		setShowTicketNotAvailable(false)

		setIsPurchasing(true)
		try {
			const result = await purchaseMutation.mutateAsync(tierId)
			if (result?.isSuccess) {
				const queued = result?.statusCode === 202
				router.push(
					queued
						? `/ticket/purchase/${tierId}?queued=1`
						: `/ticket/purchase/${tierId}`
				)
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

	const purchaseNotices = [
		t('notice1'),
		t('notice2'),
		t('notice3'),
		t('notice4'),
		t('notice5'),
		t('notice6'),
	]

	if (tiersLoading) {
		return <Loading />
	}

	if (tiersError) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-red-600 text-xl'>{t('errorOccurred')}</div>
			</div>
		)
	}

	// Full-page "ticket not available" when purchase failed due to out of stock (e.g. race with another buyer)
	if (showTicketNotAvailable) {
		return (
			<>
				<Background />
				<div className='fixed inset-0 z-[1] bg-black/40' />
				<div className='min-h-screen flex items-center justify-center relative z-10'>
					<div className='text-center'>
						<AlertCircle className='w-12 h-12 text-[#48715b] mx-auto mb-4' />
						<p className='text-text-secondary text-lg mb-2'>
							{t('ticketNotAvailable')}
						</p>
						<p className='text-text-secondary/80 text-sm mb-4'>
							{t('ticketNotAvailableHint')}
						</p>
						<button
							onClick={() => setShowTicketNotAvailable(false)}
							className='px-6 py-2.5 rounded-xl btn-primary font-medium'
						>
							{t('backToTicket')}
						</button>
					</div>
				</div>
			</>
		)
	}

	const tiers: TicketTier[] = tiersData?.data ?? []

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

					{account && isBlacklisted && (
						<div className='mb-6 text-center'>
							<p className='text-sm text-red-300 bg-black/40 backdrop-blur-sm inline-block px-5 py-2.5 rounded-xl'>
								{t('accountRestricted')}
							</p>
						</div>
					)}

					{/* Tier Cards */}
					<TicketDisplay
						tiers={tiers}
						onPurchase={handlePurchase}
						isPurchasing={purchaseMutation.isPending}
					/>

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
		</>
	)
}

export default TicketPage

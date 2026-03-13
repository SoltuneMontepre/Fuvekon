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
import type { TicketTier } from '@/types/models/ticket/ticket'
import Loading from '@/components/common/Loading'
import { AlertCircle } from 'lucide-react'

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

	const isBlacklisted = account?.is_blacklisted
	const [showTicketNotAvailable, setShowTicketNotAvailable] = useState(false)

	const handlePurchase = async (tierId: string) => {
		if (!account) {
			router.push('/login')
			return
		}
		setShowTicketNotAvailable(false)

		try {
			const result = await purchaseMutation.mutateAsync(tierId)
			if (result?.isSuccess) {
				// When queued (202), worker may still be processing; pass queued=1 so purchase page polls for ticket
				const queued = result?.statusCode === 202
				router.push(
					queued
						? `/ticket/purchase/${tierId}?queued=1`
						: `/ticket/purchase/${tierId}`
				)
			}
		} catch (err) {
			const message =
				(err as AxiosError<{ message?: string }>)?.response?.data?.message ||
				(err as Error).message ||
				t('errorOccurred')
			toast.error(message)
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

					{account && isBlacklisted && (
						<div className='mb-6 text-center'>
							<p className='text-sm text-red-300 bg-black/40 backdrop-blur-sm inline-block px-5 py-2.5 rounded-xl'>
								{t('accountRestricted')}
							</p>
						</div>
					)}

					{/* Tier Cards — 4 columns */}
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

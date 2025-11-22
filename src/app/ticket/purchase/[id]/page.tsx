'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { ticketServiceAxios } from '@/common/axios'
import { useAuthStore } from '@/stores/authStore'
import type { TicketTier } from '@/types/models/ticket/ticketTier'
import { PAYMENT_STATUS } from '@/types/models/ticket/payment'

interface TicketPurchasePageProps {
	params: Promise<{ id: string }>
}

// Mock ticket data - will be replaced with API call later
const mockTicketTiers: Record<string, TicketTier> = {
	'11111111-1111-1111-1111-111111111111': {
		id: '11111111-1111-1111-1111-111111111111',
		ticketName: 'Tier 1',
		description: 'Basic tier ticket',
		price: 1000000,
		stock: 100,
		isActive: true,
		benefits: ['Tăng lương 1', 'Tăng lương 2'],
		bannerImage: '/images/ticket/tier1-banner.webp',
	},
	'22222222-2222-2222-2222-222222222222': {
		id: '22222222-2222-2222-2222-222222222222',
		ticketName: 'Tier 2',
		description: 'Standard tier ticket',
		price: 5000000,
		stock: 50,
		isActive: true,
		benefits: [
			'Tăng lương 1',
			'Tăng lương 2',
			'Tăng lương 3',
			'Tăng lương 4',
			'Tăng lương 5',
			'Tăng lương 6',
			'Tăng lương 7',
			'Tăng lương 8',
		],
		bannerImage: '/images/ticket/tier2-banner.webp',
	},
	'33333333-3333-3333-3333-333333333333': {
		id: '33333333-3333-3333-3333-333333333333',
		ticketName: 'Tier 3',
		description: 'Premium tier ticket',
		price: 15000000,
		stock: 20,
		isActive: true,
		benefits: [
			'Tăng lương 1',
			'Tăng lương 2',
			'Tăng lương 3',
			'Tăng lương 4',
			'Tăng lương 5',
			'Tăng lương 6',
			'Tăng lương 7',
			'Tăng lương 8',
			'Tăng lương 9',
			'Tăng lương 10',
		],
		bannerImage: '/images/ticket/tier3-banner.webp',
	},
}

// Create payment link via API
const createPaymentLink = async (
	tierId: string
): Promise<{ checkout_url: string; orderCode: number }> => {
	const { data } = await ticketServiceAxios.post('/payments/payment-link', {
		tier_id: tierId,
	})
	return data
}

const TicketPurchasePage = ({
	params,
}: TicketPurchasePageProps): React.ReactElement => {
	const [tier, setTier] = useState<TicketTier | null>(null)
	const [isCreatingLink, setIsCreatingLink] = useState(false)
	const router = useRouter()
	const searchParams = useSearchParams()
	const t = useTranslations('ticket.purchase')
	const { isAuthenticated } = useAuthStore()

	// Resolve params
	useEffect(() => {
		params.then(({ id }) => {
			const ticketTier = mockTicketTiers[id]
			if (!ticketTier) {
				toast.error(t('error'))
				router.push('/tickets')
				return
			}
			setTier(ticketTier)
		})
	}, [params, router, t])

	// Handle payment return callback
	useEffect(() => {
		const status = searchParams.get('status')?.toLowerCase()
		const orderCode = searchParams.get('orderCode')

		if (status === PAYMENT_STATUS.PAID) {
			toast.success(t('paymentSuccess'))
			setTimeout(() => {
				router.push('/tickets')
			}, 2000)
		} else if (status === PAYMENT_STATUS.CANCELLED) {
			// Call API to ensure cancellation is processed server-side
			// Backend handles idempotency - safe to call multiple times
			if (orderCode) {
				ticketServiceAxios.post('/payments/cancel-by-order', null, {
					params: { orderCode }
				}).catch((error) => {
					console.error('Failed to process cancellation:', error)
					// Don't show error to user - backend idempotency ensures safety
				})
			}
			toast.error(t('paymentCancelled'))
			// Stay on page to allow retry
			router.push('/tickets')
		}
	}, [searchParams, router, t])

	const handleGetPaymentLink = async () => {
		if (!tier) return

		setIsCreatingLink(true)
		try {
			// User ID is extracted from JWT token on backend
			const result = await createPaymentLink(tier.id)

			if (result.checkout_url) {
				// Open payment URL in a new window/tab for redirection
				window.open(result.checkout_url, '_blank', 'noopener,noreferrer')
			} else {
				toast.error(t('error'))
			}
		} catch (error) {
			console.error('Failed to create payment link:', error)
			toast.error(t('error'))
		} finally {
			setIsCreatingLink(false)
		}
	}

	if (!tier) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-white'>{t('loading')}</div>
			</div>
		)
	}

	if (!isAuthenticated) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<div className='text-red-400 mb-4'>
						{t('authRequired')}
					</div>
					<button
						onClick={() => router.push('/login')}
						className='bg-[#7cbc97] hover:bg-[#6ba885] text-white font-bold py-2 px-4 rounded transition-colors'
					>
						{t('login')}
					</button>
				</div>
			</div>
		)
	}

	// Format price with Vietnamese Dong formatting
	const formatPrice = (price: number): string => {
		return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ'
	}

	return (
		<div className='min-h-screen w-full relative'>
			{/* Background */}
			<div className='absolute inset-0 -z-20 overflow-hidden'>
				<div className='absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900' />
			</div>

			{/* Main content */}
			<div className='relative z-10 container mx-auto px-4 py-8 md:py-16'>
				<div className='max-w-2xl mx-auto'>
					{/* Page title */}
					<div className='text-center mb-8'>
						<h1 className='josefin text-4xl md:text-6xl font-bold text-white uppercase mb-4'>
							{t('title')}
						</h1>
					</div>

					{/* Ticket info card */}
					<div className='bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6'>
						<h2 className='josefin text-2xl font-semibold text-slate-900 dark:text-white mb-4'>
							{tier.ticketName}
						</h2>
						<p className='text-slate-600 dark:text-slate-300 mb-4'>
							{tier.description}
						</p>
						<div className='flex justify-between items-center'>
							<span className='text-lg font-semibold text-slate-900 dark:text-white'>
								{formatPrice(tier.price)}
							</span>
						</div>
					</div>

					{/* Payment button */}
					<div className='text-center'>
						{isCreatingLink ? (
							<div className='bg-slate-700 text-white py-4 px-8 rounded-lg'>
								{t('creatingLink')}
							</div>
						) : (
							<button
								onClick={handleGetPaymentLink}
								className='bg-[#7cbc97] hover:bg-[#6ba885] text-white font-bold py-4 px-8 rounded-lg transition-colors josefin text-xl'
							>
								{t('title')}
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default TicketPurchasePage

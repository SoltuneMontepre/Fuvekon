'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import TicketTierList from '@/components/ticket/TicketTierList'
import type { TicketTier } from '@/types/models/ticket/ticketTier'

// Mock data - will be replaced with API call later
const mockTicketTiers: TicketTier[] = [
	{
		id: '11111111-1111-1111-1111-111111111111',
		ticketName: 'Tier 1',
		description: 'Basic tier ticket',
		price: 1000000,
		stock: 100,
		isActive: true,
		benefits: ['Tăng lương 1', 'Tăng lương 2'],
		bannerImage: '/images/ticket/tier1-banner.webp',
	},
	{
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
	{
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
]

const TicketsPage = (): React.ReactElement => {
	const t = useTranslations('ticket')

	return (
		<div className='min-h-screen w-full relative'>
			{/* Background - will use the same background pattern as landing */}
			<div className='absolute inset-0 -z-20 overflow-hidden'>
				{/* Background pattern similar to landing page */}
				<div className='absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900' />
			</div>

			{/* Main content */}
			<div className='relative z-10 container mx-auto px-4 py-8 md:py-16'>
				{/* Page title */}
				<div className='text-center mb-12'>
					<h1 className='josefin text-4xl md:text-6xl font-bold text-white uppercase mb-4'>
						{t('title')}
					</h1>
				</div>

				{/* Ticket tiers */}
				<TicketTierList tiers={mockTicketTiers} />
			</div>
		</div>
	)
}

export default TicketsPage

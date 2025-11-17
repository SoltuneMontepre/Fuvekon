'use client'

import React from 'react'
import type { TicketTier } from '@/types/models/ticket/ticketTier'
import TicketTierCard from './TicketTierCard'

interface TicketTierListProps {
	tiers: TicketTier[]
	showBuyButtonOnAll?: boolean
}

const TicketTierList: React.FC<TicketTierListProps> = ({
	tiers,
	showBuyButtonOnAll = false,
}) => {
	return (
		<div className='w-full flex justify-between px-4 py-12'>
			{tiers.map((tier, index) => (
				<div key={tier.id} className='w-[30%] flex-shrink-0 scale-95'>
					<TicketTierCard
						tier={tier}
						showBuyButton={showBuyButtonOnAll || index === tiers.length - 1}
					/>
				</div>
			))}
		</div>
	)
}

export default TicketTierList


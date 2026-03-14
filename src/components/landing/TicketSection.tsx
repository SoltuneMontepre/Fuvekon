import { useGetTiers } from '@/hooks/services/ticket/useTicket'
import React from 'react'
import TicketDisplay from '../ticket/TicketDisplay'
import { TicketTier } from '@/types/models/ticket/ticket'

interface TicketSectionProps {
	id: string
}

const TicketSection = ({ id }: TicketSectionProps) => {
	const { data: tiersData } = useGetTiers()

	const tiers: TicketTier[] = tiersData?.data ?? []

	return (
		<div
			id={id}
			className='section h-dvh w-dvw relative z-10 flex items-center justify-center overflow-hidden py-12 px-4'
		>
			<div className='w-full max-w-7xl mx-auto'>
				<TicketDisplay
					tiers={tiers}
					onPurchase={() => {}}
					isPurchasing={false}
				/>
			</div>
		</div>
	)
}

export default TicketSection

'use client'

import React from 'react'

// This is the parallel route slot for ticket page
// It should show ticket-specific header info when on /account/ticket
export default function TicketInfoSlot() {
	return (
		<div className='rounded-[30px] bg-[#E9F5E7] p-8 shadow-sm text-text-secondary'>
			<h1 className='text-3xl font-bold text-center'>VÉ CỦA BẠN</h1>
		</div>
	)
}

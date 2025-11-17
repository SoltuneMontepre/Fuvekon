import { redirect } from 'next/navigation'
import React from 'react'

// Redirect /ticket to /tickets for consistency
const TicketPage = async (): Promise<never> => {
	redirect('/tickets')
}

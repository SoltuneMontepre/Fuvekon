'use client'

import React from 'react'
import MyTicketDisplay from '@/components/ticket/MyTicketDisplay'

const AccountTicketPage = (): React.ReactElement => {
	return (
		<div className='w-full space-y-6'>
			<MyTicketDisplay />
		</div>
	)
}

export default AccountTicketPage

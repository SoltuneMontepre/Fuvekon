'use client'

import React from 'react'
import MyTicketDisplay from '@/components/ticket/MyTicketDisplay'

const AccountTicketPage = (): React.ReactElement => {
	return (
		<div className='w-full space-y-6'>
			<div className='rounded-[30px] bg-[#E9F5E7] p-8 shadow-sm text-text-secondary'>
				<h1 className='text-3xl font-bold text-center'>VÉ CỦA BẠN</h1>
			</div>
			<MyTicketDisplay />
		</div>
	)
}

export default AccountTicketPage

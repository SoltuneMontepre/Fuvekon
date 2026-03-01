'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import MyTicketDisplay from '@/components/ticket/MyTicketDisplay'

const AccountTicketPage = (): React.ReactElement => {
	const t = useTranslations('ticket')
	return (
		<div className='w-full space-y-6'>
			<div className='rounded-[30px] p-8 shadow-sm text-text-secondary'>
				<h1 className='text-3xl font-bold text-center'>
					{t('yourTicketTitle')}
				</h1>
			</div>
			<MyTicketDisplay />
		</div>
	)
}

export default AccountTicketPage

import React from 'react'

interface TicketPurchasePageProps {
	params: Promise<{ id: string }>
}

const TicketPurchasePage = async ({
	params,
}: TicketPurchasePageProps): Promise<React.ReactElement> => {
	const { id } = await params
	return <div>{id}</div>
}

export default TicketPurchasePage

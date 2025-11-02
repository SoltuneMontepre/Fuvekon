import React from 'react'

const TicketPurchasePage = async ({
	params,
}: {
	params: Promise<{ id: string }>
}): Promise<React.ReactElement> => {
	const { id } = await params
	return <div>{id}</div>
}

export default TicketPurchasePage

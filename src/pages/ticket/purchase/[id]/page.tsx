import React from 'react'
import { useParams } from 'react-router'

const TicketPurchasePage = (): React.ReactElement => {
	const { id } = useParams()
	return <div>{id}</div>
}

export default TicketPurchasePage

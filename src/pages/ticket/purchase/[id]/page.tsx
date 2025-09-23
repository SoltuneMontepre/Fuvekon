import React from 'react'
import { useParams } from 'react-router'

const page = () => {
	const { id } = useParams()
	return <div>{id}</div>
}

export default page

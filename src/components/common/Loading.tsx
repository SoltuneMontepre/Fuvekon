import React from 'react'

const Loading = (): React.ReactElement => {
	return (
		<div className='fixed inset-0 center h-screen w-screen backdrop-blur-md z-50'>
			<div className='p-10 bg-gray-300'>Loading...</div>
		</div>
	)
}

export default Loading

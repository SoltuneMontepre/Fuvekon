import Image from 'next/image'
import React from 'react'

const ComingSoon = () => {
	return (
		<div className='fixed flex items-center backdrop-blur-xs bg-black/10 justify-center min-h-dvh w-full z-10'>
			<Image
				className='drop-shadow-[0_0_30px_rgba(255,255,255,1)]'
				src='/assets/common/coming_soon.png'
				alt='Coming Soon'
				width={700}
				height={500}
			/>
		</div>
	)
}

export default ComingSoon

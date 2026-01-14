import Image from 'next/image'
import React from 'react'

const CraneBanner = ({ reversed }: { reversed?: boolean }) => {
	const imgs = Array.from({ length: 14 }).map((_, idx) => (
		<Image
			key={idx}
			src='/assets/hac.webp'
			alt='Bird'
			width={250}
			height={300}
			style={{ transform: reversed ? 'scaleX(-1)' : undefined }}
			className='h-auto scale-[80%]'
		/>
	))

	return (
		<div
			className={`absolute flex ${
				reversed ? 'flex-row-reverse crane' : 'crane-reversed bottom-0'
			}`}
		>
			{imgs}
		</div>
	)
}

export default CraneBanner

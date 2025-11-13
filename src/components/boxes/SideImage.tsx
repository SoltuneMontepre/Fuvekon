import Image from 'next/image'
import React from 'react'

type SideImageProps = {
	src: string
	alt: string
}

const SideImage = ({ src, alt }: SideImageProps) => {
	return (
		<Image
			className='object-contain min-w-[400] transition-opacity duration-300'
			src={src}
			alt={alt}
			width={400}
			height={300}
			priority
		/>
	)
}

export default SideImage

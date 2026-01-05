import React from 'react'
import S3Image from '@/components/common/S3Image'

type SideImageProps = {
	src: string
	alt: string
}

const SideImage = ({ src, alt }: SideImageProps) => {
	return (
		<S3Image
			className='object-contain min-w-[400px] transition-opacity duration-300'
			src={src}
			alt={alt}
			width={400}
			height={300}
			priority
		/>
	)
}

export default SideImage

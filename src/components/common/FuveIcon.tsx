import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const FuveIcon = ({
	className,
}: {
	className?: string
}): React.ReactElement => {
	return (
		<Link href='/' className={className}>
			<Image
				src='/assets/common/logo_black.webp'
				alt='Fuve'
				className='object-contain size-12'
				width={48}
				height={48}
				priority
			/>
		</Link>
	)
}

export default FuveIcon

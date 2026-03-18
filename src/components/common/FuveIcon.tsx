import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const FuveIcon = ({
	className,
	black = false,
	iconClassName,
}: {
	className?: string
	iconClassName?: string
	black?: boolean
}): React.ReactElement => {
	return (
		<Link href='/' className={className}>
			<Image
				src={
					black
						? '/assets/common/logo_black.webp'
						: '/assets/common/logo_yellow.webp'
				}
				alt='Fuve'
				className={`object-contain size-15 ${iconClassName}`}
				width={48}
				height={48}
				priority
			/>
		</Link>
	)
}

export default FuveIcon

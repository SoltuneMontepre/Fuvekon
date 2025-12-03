import Image from 'next/image'
import React from 'react'

const ThemeTitle = ({ className }: { className?: string }) => {
	return (
		<Image
			className={`landing-bg ${className ?? ''}`}
			src='/assets/theme-title.webp'
			alt='theme-title-image'
			priority
			width={400}
			height={200}
		/>
	)
}

export default ThemeTitle

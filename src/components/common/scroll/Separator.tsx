import Image from 'next/image'
import React from 'react'

type SeparatorProps = {
	className?: string
}

const Separator = ({ className }: SeparatorProps) => {
	return (
		<Image
			className={className}
			height={15}
			width={1445}
			src='/components/rule-separator.png'
			alt='Scroll Separator'
		/>
	)
}

export default Separator

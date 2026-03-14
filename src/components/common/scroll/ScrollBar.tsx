import Image from 'next/image'
import React from 'react'

const ScrollBar = ({
	onClick,
	disabled,
}: {
	onClick: () => void
	disabled?: boolean
}) => {
	return (
		<button
			className={`scroll-bar border-0 p-0 bg-transparent ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
			onClick={disabled ? undefined : onClick}
			aria-label='Toggle scroll content'
			disabled={disabled}
		>
			<Image
				src='/components/scroll-bar.png'
				alt=''
				width={1728}
				height={64}
				className='max-w-full h-auto select-none pointer-events-none'
				draggable={false}
			/>
		</button>
	)
}

export default ScrollBar

import React from 'react'
import { NavLink } from 'react-router'

const FuveIcon = ({
	className,
}: {
	className?: string
}): React.ReactElement => {
	return (
		<NavLink to='/' className={className}>
			<img
				src='/images/common/logo_black.webp'
				alt='Fuve'
				className='object-contain size-12'
			/>
		</NavLink>
	)
}

export default FuveIcon

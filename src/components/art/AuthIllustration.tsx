'use client'

import React from 'react'
import Image from 'next/image'

const AuthIllustration = (): React.ReactElement => {
	return (
		<div
			id='login-illustration-container'
			className='login-illustration-container absolute inset-0 w-full h-full z-10 pointer-events-none select-none hidden md:block overflow-hidden'
		>
			<Image
			// why is this image even working ???
				src='/images/landing/tranh full oc.webp'
				alt='Fantasy Character'
				fill
				className='login-illustration object-cover object-[50%_0%] scale-y-130 scale-x-130 translate-x-[-380px] translate-y-[-17px]'
				priority
			/>
		</div>
	)
}

export default AuthIllustration

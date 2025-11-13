'use client'
import GrainyBox from '@/components/boxes/GrainyBox'
import SideImage from '@/components/boxes/SideImage'
import React from 'react'

const ArtBookCardSection = () => {
	return (
		<div className='flex h-full max-w-[750px] items-center mx-auto relative'>
			{/* Left */}
			<div className='relative z-0 w-1/2 flex justify-center items-center ml-12'>
				<SideImage src='/images/artbook/badges.png' />
			</div>

			{/* Right */}
			<div className='-ml-12 relative z-10 w-full'>
				{/* main box with grain */}
				<GrainyBox />

				{/* extra mask */}
				<div className='absolute inset-0 pointer-events-none'>
					<div className="absolute inset-0 [-webkit-mask-image:url('/textures/asfalt-dark.png')] [mask-image:url('/textures/asfalt-dark.png')] [-webkit-mask-repeat:repeat] [mask-repeat:repeat] [-webkit-mask-size:100px] [mask-size:100px] bg-[rgba(0,0,0,0.6)]" />
				</div>
			</div>
		</div>
	)
}

export default ArtBookCardSection

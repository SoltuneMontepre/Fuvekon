import React from 'react'

const GrainyBox = () => {
	return (
		<svg
			className='pointer-events-none'
			height='420'
			width='400'
			viewBox='0 0 756 869'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<g filter='url(#filter0_g_296_70)'>
				<path
					d='M16 74C16 41.9675 41.9675 16 74 16H681.54C713.572 16 739.54 41.9675 739.54 74V795C739.54 827.033 713.572 853 681.54 853H74C41.9675 853 16 827.033 16 795V74Z'
					fill='#E2EEE2'
				/>
			</g>
			<defs>
				<filter
					id='filter0_g_296_70'
					x='0'
					y='0'
					width='755.539'
					height='869'
					filterUnits='userSpaceOnUse'
					colorInterpolationFilters='sRGB'
				>
					<feFlood floodOpacity='0' result='BackgroundImageFix' />
					<feBlend
						mode='normal'
						in='SourceGraphic'
						in2='BackgroundImageFix'
						result='shape'
					/>
					<feTurbulence
						type='fractalNoise'
						baseFrequency='1.4285714626312256 1.4285714626312256'
						numOctaves='3'
						seed='2863'
					/>
					<feDisplacementMap
						in='shape'
						scale='32'
						xChannelSelector='R'
						yChannelSelector='G'
						result='displacedImage'
						width='100%'
						height='100%'
					/>
					<feMerge result='effect1_texture_296_70'>
						<feMergeNode in='displacedImage' />
					</feMerge>
				</filter>
			</defs>
		</svg>
	)
}

export default GrainyBox

import React from 'react'

const ScrollHeader = () => {
	return (
		<svg
			width='500'
			height='64'
			viewBox='0 0 580 64'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<g filter='url(#filter0_i_193_133)'>
				<circle cx='24.5' cy='31.5' r='24.5' fill='#48715B' />
			</g>
			<g filter='url(#filter1_i_193_133)'>
				<circle cx='555.5' cy='31.5' r='24.5' fill='#48715B' />
			</g>
			<g filter='url(#filter2_in_193_133)'>
				<rect x='36' width='508' height='64' fill='#154C5B' />
			</g>
			<defs>
				<filter
					id='filter0_i_193_133'
					x='0'
					y='1'
					width='49'
					height='55'
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
					<feColorMatrix
						in='SourceAlpha'
						type='matrix'
						values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
						result='hardAlpha'
					/>
					<feOffset dy='-6' />
					<feGaussianBlur stdDeviation='5.55' />
					<feComposite in2='hardAlpha' operator='arithmetic' k2='-1' k3='1' />
					<feColorMatrix
						type='matrix'
						values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'
					/>
					<feBlend
						mode='normal'
						in2='shape'
						result='effect1_innerShadow_193_133'
					/>
				</filter>
				<filter
					id='filter1_i_193_133'
					x='531'
					y='1'
					width='49'
					height='55'
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
					<feColorMatrix
						in='SourceAlpha'
						type='matrix'
						values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
						result='hardAlpha'
					/>
					<feOffset dy='-6' />
					<feGaussianBlur stdDeviation='5.55' />
					<feComposite in2='hardAlpha' operator='arithmetic' k2='-1' k3='1' />
					<feColorMatrix
						type='matrix'
						values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'
					/>
					<feBlend
						mode='normal'
						in2='shape'
						result='effect1_innerShadow_193_133'
					/>
				</filter>
				<filter
					id='filter2_in_193_133'
					x='36'
					y='-7'
					width='508'
					height='71'
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
					<feColorMatrix
						in='SourceAlpha'
						type='matrix'
						values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
						result='hardAlpha'
					/>
					<feMorphology
						radius='2'
						operator='erode'
						in='SourceAlpha'
						result='effect1_innerShadow_193_133'
					/>
					<feOffset dy='-7' />
					<feGaussianBlur stdDeviation='8.65' />
					<feComposite in2='hardAlpha' operator='arithmetic' k2='-1' k3='1' />
					<feColorMatrix
						type='matrix'
						values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'
					/>
					<feBlend
						mode='normal'
						in2='shape'
						result='effect1_innerShadow_193_133'
					/>
					<feTurbulence
						type='fractalNoise'
						baseFrequency='0.023866347968578339 0.023866347968578339'
						stitchTiles='stitch'
						numOctaves='3'
						result='noise'
						seed='1854'
					/>
					<feColorMatrix
						in='noise'
						type='luminanceToAlpha'
						result='alphaNoise'
					/>
					<feComponentTransfer in='alphaNoise' result='coloredNoise1'>
						<feFuncA
							type='discrete'
							tableValues='0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 '
						/>
					</feComponentTransfer>
					<feComposite
						operator='in'
						in2='effect1_innerShadow_193_133'
						in='coloredNoise1'
						result='noise1Clipped'
					/>
					<feComponentTransfer in='alphaNoise' result='coloredNoise2'>
						<feFuncA
							type='discrete'
							tableValues='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 '
						/>
					</feComponentTransfer>
					<feComposite
						operator='in'
						in2='effect1_innerShadow_193_133'
						in='coloredNoise2'
						result='noise2Clipped'
					/>
					<feFlood floodColor='rgba(17, 62, 75, 0.54)' result='color1Flood' />
					<feComposite
						operator='in'
						in2='noise1Clipped'
						in='color1Flood'
						result='color1'
					/>
					<feFlood floodColor='rgba(47, 127, 123, 0.25)' result='color2Flood' />
					<feComposite
						operator='in'
						in2='noise2Clipped'
						in='color2Flood'
						result='color2'
					/>
					<feMerge result='effect2_noise_193_133'>
						<feMergeNode in='effect1_innerShadow_193_133' />
						<feMergeNode in='color1' />
						<feMergeNode in='color2' />
					</feMerge>
				</filter>
			</defs>
		</svg>
	)
}

export default ScrollHeader

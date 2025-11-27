import Image from 'next/image'
import React from 'react'

const Mascot = ({ className }: { className?: string }) => {
	return (
		<Image
			id='mascot'
			className={`landing-bg ${className ?? ''}`}
			src='/assets/mascot.png'
			alt='mascot-image'
			priority
			fill
		/>
	)
}

export default Mascot

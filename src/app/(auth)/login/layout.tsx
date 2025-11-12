import React from 'react'
import Background from '@/components/landing/hero_section/Background'

type LoginLayoutProps = {
	form: React.ReactElement
}

const LoginLayout = ({ form }: LoginLayoutProps): React.ReactElement => {
	return (
		<div className='relative min-h-screen w-full flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8'>
			<div className='fixed inset-0 w-full h-full z-[-10]'>
				<div className='absolute inset-0 blur-sm scale-110'>
					<Background />
				</div>
			</div>
			{form}
		</div>
	)
}

export default LoginLayout

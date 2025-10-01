import React from 'react'
import FuveIcon from '../common/FuveIcon'
import LoginButton from '../auth/LoginButton'
import LogoutButton from '../auth/LogoutButton'
import NavButtons from './NavButtons'

const NavBar = (): React.ReactElement => {
	const isLoggedIn = false

	return (
		<nav
			role='navigation'
			aria-label='Main Navigation'
			className='flex w-screen justify-around px-5 sm:px-10 md:px-20 py-2 cap-width mx-auto'
		>
			<FuveIcon className='flex-1/5 size-10' />

			<div className='grow' />

			<NavButtons className='flex-2/5 josefin font-medium text-white uppercase' />

			<div className='grow' />

			<div className='flex-1/5 flex justify-end'>
				{isLoggedIn ? <LogoutButton /> : <LoginButton />}
			</div>
		</nav>
	)
}

export default NavBar

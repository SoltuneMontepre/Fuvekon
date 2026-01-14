'use client'

import React from 'react'
import FuveIcon from '../common/FuveIcon'
import LoginButton from '../auth/login/LoginButton'
import NavButtons from './NavButtons'
import { useAuthStore } from '@/stores/authStore'

const NavBar = (): React.ReactElement => {
	const account = useAuthStore(state => state.account)
	const isLoggedIn = !!account

	return (
		<nav
			id='navbar'
			role='navigation'
			aria-label='Main Navigation'
			className='navbar relative z-50 flex w-screen justify-around px-5 sm:px-10 md:px-20 py-2 cap-width mx-auto'
		>
			<div id='navbar-logo-container' className='navbar-logo-container flex-1/5'>
				<FuveIcon className='navbar-logo size-10' />
			</div>

			<div className='navbar-spacer-left grow' />

			{!isLoggedIn && (
				<div id='navbar-buttons-container' className='navbar-buttons-container flex-2/5'>
					<NavButtons className='navbar-buttons josefin font-medium text-white uppercase' />
				</div>
			)}

			<div className='navbar-spacer-right grow' />

			<div id='navbar-auth-container' className='navbar-auth-container flex-1/5 flex justify-end'>
				{!isLoggedIn && <LoginButton />}
			</div>
		</nav>
	)
}

export default NavBar

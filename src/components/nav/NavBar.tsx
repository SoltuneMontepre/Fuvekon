'use client'

import React from 'react'
import FuveIcon from '../common/FuveIcon'
import LoginButton from '../auth/LoginButton'
import LogoutButton from '../auth/LogoutButton'
import NavButtons from './NavButtons'
import { useAuthStore } from '@/stores/authStore'

const NavBar = (): React.ReactElement => {
	const isLoggedIn = useAuthStore(state => state.isAuthenticated)

	return (
		<nav
			role='navigation'
			aria-label='Main Navigation'
			className='relative z-50 flex w-screen justify-around px-5 sm:px-10 md:px-20 py-2 cap-width mx-auto pointer-events-none'
		>
			<FuveIcon className='flex-1/5 size-10 pointer-events-auto' />

			<div className='grow pointer-events-none' />

			<NavButtons className='flex-2/5 josefin font-medium text-white uppercase pointer-events-auto' />

			<div className='grow pointer-events-none' />

			<div className='flex-1/5 flex justify-end pointer-events-auto'>
				{isLoggedIn ? <LogoutButton /> : <LoginButton />}
			</div>
		</nav>
	)
}

export default NavBar

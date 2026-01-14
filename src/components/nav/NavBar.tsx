'use client'

import React, { useEffect, useState } from 'react'
import FuveIcon from '../common/FuveIcon'
import LoginButton from '../auth/login/LoginButton'
import LogoutButton from '../auth/login/LogoutButton'
import NavButtons from './NavButtons'
import { useAuthStore } from '@/stores/authStore'
import Loading from '../common/Loading'
import { useLinkStatus } from 'next/link'

const NavBar = (): React.ReactElement => {
	const isLoggedIn = useAuthStore(state => state.isAuthenticated)
	const { pending } = useLinkStatus()
	const [isNavigating, setIsNavigating] = useState(false)

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout> | undefined
		if (pending) {
			timer = setTimeout(() => setIsNavigating(true), 120)
		} else {
			if (timer) clearTimeout(timer)
			const closeTimer = setTimeout(() => setIsNavigating(false), 80)
			return () => clearTimeout(closeTimer)
		}
		return () => timer && clearTimeout(timer)
	}, [pending])

	return (
		<>
			{isNavigating && <Loading />}
			<nav
				role='navigation'
				aria-label='Main Navigation'
				className='relative z-50 flex w-screen justify-around px-5 sm:px-10 md:px-20 py-2 cap-width mx-auto pointer-events-none'
			>
				<div className='flex-none'>
					<FuveIcon className='size-10 pointer-events-auto' />
				</div>

				<div className='grow pointer-events-none' />

				<NavButtons className='josefin font-medium uppercase pointer-events-auto' />

				<div className='grow pointer-events-none' />

				<div className='flex justify-end pointer-events-auto'>
					{isLoggedIn ? <LogoutButton /> : <LoginButton />}
				</div>
			</nav>
		</>
	)
}

export default NavBar

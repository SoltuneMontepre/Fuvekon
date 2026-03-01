'use client'

import React, { useEffect, useState } from 'react'
import FuveIcon from '../common/FuveIcon'
import LoginButton from '../auth/login/LoginButton'
import NavButtons from './NavButtons'
import { useAuthStore } from '@/stores/authStore'
import Loading from '../common/Loading'
import { useLinkStatus } from 'next/link'
import ProfileButton from './ProfileButton'
import LanguageSelector from '@/components/config/LanguageSelector'
import ReducedMotionToggle from '@/components/config/ReducedMotionToggle'
import { usePathname } from 'next/navigation'

const NavBar = (): React.ReactElement => {
	const isLoggedIn = useAuthStore(state => state.isAuthenticated)
	const { pending } = useLinkStatus()
	const [isNavigating, setIsNavigating] = useState(false)
	const path = usePathname()

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

	const visiblePaths = ['/ticket', '/']

	return (
		<>
			{isNavigating && <Loading />}
			<nav
				role='navigation'
				aria-label='Main Navigation'
				className='relative z-50 flex w-screen justify-around px-5 sm:px-10 md:px-20 cap-width mx-auto pointer-events-none'
			>
				<div className='flex-none z-20 pt-1'>
					{(isLoggedIn && visiblePaths.includes(path ?? '')) || !isLoggedIn ? (
						<FuveIcon className='size-10 pointer-events-auto hover:opacity-70 transition-all duration-200' />
					) : null}
				</div>

				<div className='absolute h-full w-full bg-gradient-to-b from-black/90 to-transparent' />

				<div className='grow pointer-events-none' />

				<NavButtons className='josefin py-2 font-medium z-20 uppercase pointer-events-auto' />

				<div className='grow pointer-events-none' />

				<div className='flex items-center gap-2 justify-end pointer-events-auto'>
					<ReducedMotionToggle />
					<LanguageSelector />
					{isLoggedIn ? <ProfileButton /> : <LoginButton />}
				</div>
			</nav>
		</>
	)
}

export default NavBar

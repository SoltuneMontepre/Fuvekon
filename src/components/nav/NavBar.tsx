'use client'

import React, { useEffect, useState } from 'react'
import FuveIcon from '../common/FuveIcon'
import LoginButton from '../auth/login/LoginButton'
import NavButtons from './NavButtons'
import { useAuthStore } from '@/stores/authStore'
import Loading from '../common/Loading'
import { useLinkStatus } from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import ProfileButton from './ProfileButton'
import LanguageSelector from '@/components/config/LanguageSelector'
import MobileMenu from './MobileMenu'

const HIDE_LOGO_PREFIXES = ['/account', '/admin']

const NavBar = (): React.ReactElement => {
	const isLoggedIn = useAuthStore(state => state.isAuthenticated)
	const { pending } = useLinkStatus()
	const pathname = usePathname()
	const [isNavigating, setIsNavigating] = useState(false)
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	const hideLogo = HIDE_LOGO_PREFIXES.some(p => pathname?.startsWith(p))

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

	useEffect(() => {
		setMobileMenuOpen(false)
	}, [pathname])

	return (
		<>
			{isNavigating && <Loading />}
			<nav
				role='navigation'
				aria-label='Main Navigation'
				className='relative z-50 flex w-screen justify-around px-5 sm:px-10 md:px-20 py-2 cap-width mx-auto pointer-events-none'
			>
				{!hideLogo && (
					<>
						<div className='flex-none'>
							<FuveIcon className='size-10 pointer-events-auto' />
						</div>
						<div className='grow pointer-events-none' />

						<NavButtons className='josefin font-medium uppercase pointer-events-auto' />
					</>
				)}

				<div className='grow pointer-events-none' />

				<div className='flex items-center gap-2 justify-end pointer-events-auto'>
					<div className='hidden lg:flex items-center gap-2'>
						<LanguageSelector />
						{isLoggedIn ? <ProfileButton /> : <LoginButton />}
					</div>
					<button
						onClick={() => setMobileMenuOpen(true)}
						className='lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors'
						aria-label='Open menu'
					>
						<Menu className='size-6' />
					</button>
				</div>
			</nav>

			<MobileMenu
				isOpen={mobileMenuOpen}
				onClose={() => setMobileMenuOpen(false)}
			/>
		</>
	)
}

export default NavBar

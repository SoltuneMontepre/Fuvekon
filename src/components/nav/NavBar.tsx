'use client'

import React, { useEffect, useState } from 'react'
import FuveIcon from '../common/FuveIcon'
import NavButtons from './NavButtons'
import MobileMenu from './MobileMenu'
import { useLinkStatus } from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import ReducedMotionToggle from '../config/ReducedMotionToggle'
import { useAuthStore } from '@/stores/authStore'
import LoginButton from '../auth/login/LoginButton'
import ProfileButton from './ProfileButton'
import LanguageSelector from '../config/LanguageSelector'

const HIDE_LOGO_PREFIXES = ['/account', '/admin']

const NavBar = (): React.ReactElement => {
	const { pending } = useLinkStatus()
	const pathname = usePathname()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const isLoggedIn = useAuthStore(state => state.isAuthenticated)
	const isLanding = pathname === '/'

	const hideLogo = HIDE_LOGO_PREFIXES.some(p => pathname?.startsWith(p))
	const path = usePathname()

	const visiblePaths = ['/ticket', '/', '/about']

	useEffect(() => {
		setMobileMenuOpen(false)
	}, [pathname])

	return (
		<>
			{/* Instant top progress bar — shows on first paint of pending */}
			<div
				aria-hidden='true'
				className={`fixed top-0 left-0 h-[3px] z-[9999] bg-[#48715B] transition-all duration-300 ease-out ${
					pending ? 'w-3/4 opacity-100' : 'w-full opacity-0'
				}`}
				style={{ transitionProperty: 'width, opacity' }}
			/>
			<nav
				role='navigation'
				aria-label='Main Navigation'
				className='relative z-50 flex w-screen justify-around px-5 sm:px-10 md:px-20 cap-width mx-auto pointer-events-none'
			>
				{!hideLogo && (
					<>
						<div className='flex-none z-20 pt-1'>
							{(isLoggedIn && visiblePaths.includes(path ?? '')) ||
							!isLoggedIn ? (
								<FuveIcon className='size-10 pointer-events-auto hover:opacity-70 transition-all duration-200' />
							) : null}
						</div>

						<div className='absolute h-full w-full bg-gradient-to-b from-black/90 to-transparent pointer-events-none' />
						<div className='grow pointer-events-none' />

						<NavButtons className='josefin py-2 font-medium z-20 uppercase pointer-events-auto' />
					</>
				)}

				<div className='grow pointer-events-none' />

				<div className='flex py-2 z-30 items-center gap-2 justify-end pointer-events-auto'>
					<ReducedMotionToggle />
					<div className='hidden md:flex'>
						<LanguageSelector />
					</div>
					<div className='hidden md:flex'>
						{isLoggedIn ? <ProfileButton /> : <LoginButton />}
					</div>
					<div className='md:hidden flex'>
						{hideLogo || !isLanding ? (
							<button
								onClick={() => setMobileMenuOpen(true)}
								className='p-2 rounded-lg hover:bg-white/10 transition-colors'
								aria-label='Open menu'
							>
								<Menu className='size-6' />
							</button>
						) : (
							<>
								<button
									onClick={() => setMobileMenuOpen(true)}
									className='p-2 rounded-lg hover:bg-white/10 transition-colors'
									aria-label='Open menu'
								>
									<Menu className='size-6' />
								</button>
							</>
						)}
					</div>
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

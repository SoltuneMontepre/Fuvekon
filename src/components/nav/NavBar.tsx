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
				className='relative z-50 w-full px-5 sm:px-10 md:px-20 pointer-events-none'
			>
				<div
					className='absolute inset-0 h-full w-full bg-gradient-to-b from-black/90 to-transparent pointer-events-none'
					aria-hidden='true'
				/>

				<div className='relative z-20 grid grid-cols-12 items-center py-2'>
					<div className='col-span-3 flex items-center pt-1'>
						{!hideLogo &&
						((isLoggedIn && visiblePaths.includes(path ?? '')) ||
							!isLoggedIn) ? (
							<FuveIcon className='size-15 pointer-events-auto hover:opacity-70 transition-all duration-200' />
						) : null}
					</div>

					<div className='col-span-6 flex justify-center'>
						{!hideLogo ? (
							<NavButtons className='josefin font-medium uppercase pointer-events-auto' />
						) : null}
					</div>

					<div className='col-span-3 flex items-center justify-end gap-2 pointer-events-auto'>
						<ReducedMotionToggle />
						<div className='hidden md:flex'>
							<LanguageSelector />
						</div>
						<div className='hidden md:flex'>
							{isLoggedIn ? <ProfileButton /> : <LoginButton />}
						</div>
						<div className='md:hidden flex'>
							<button
								onClick={() => setMobileMenuOpen(true)}
								className='p-2 rounded-lg hover:bg-white/10 transition-colors'
								aria-label='Open menu'
							>
								<Menu className='size-6' />
							</button>
						</div>
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

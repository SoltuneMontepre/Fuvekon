'use client'

import React, { useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
	X,
	UserCircle,
	Ticket,
	Lock,
	Store,
	LogIn,
	LogOut,
	UserPlus,
	Shield,
} from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from '@/common/gsap'
import { NavData, useNavDatas } from '@/config/nav'
import { useAuthStore } from '@/stores/authStore'
import { useLogout } from '@/hooks/services/auth/useLogout'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import LanguageSelector from '@/components/config/LanguageSelector'
import FuveIcon from '../common/FuveIcon'
import { useThemeStore } from '@/config/Providers/ThemeProvider'

type MobileMenuProps = {
	isOpen: boolean
	onClose: () => void
}

const MobileMenu = ({
	isOpen,
	onClose,
}: MobileMenuProps): React.ReactElement | null => {
	const pathname = usePathname()
	const navItems = useNavDatas()
	const isLoggedIn = useAuthStore(state => state.isAuthenticated)
	const account = useAuthStore(state => state.account)
	const logoutMutation = useLogout()
	const router = useRouter()
	const tNav = useTranslations('nav')
	const tAuth = useTranslations('auth')
	const panelRef = useRef<HTMLDivElement>(null)
	const overlayRef = useRef<HTMLDivElement>(null)
	const itemsRef = useRef<HTMLDivElement>(null)
	const tlRef = useRef<gsap.core.Timeline | null>(null)
	const preferReducedMotion = useThemeStore(state => state.prefersReducedMotion)

	const animateClose = useCallback(() => {
		if (!tlRef.current) {
			onClose()
			return
		}
		const tl = gsap.timeline({
			onComplete: onClose,
		})
		if (!preferReducedMotion) {
			tl.to(itemsRef.current?.children ?? [], {
				x: 60,
				opacity: 0,
				duration: 0.05,
				stagger: 0.02,
			})
		}
		tl.to(
			panelRef.current,
			{
				x: '100%',
				duration: 0.2,
				ease: 'power3.in',
			},
			preferReducedMotion ? '0' : '-=0.1'
		)
		tl.to(
			overlayRef.current,
			{
				opacity: 0,
				duration: 0.1,
			},
			'-=0.3'
		)
	}, [onClose, preferReducedMotion])

	useGSAP(
		() => {
			if (
				!isOpen ||
				!panelRef.current ||
				!overlayRef.current ||
				!itemsRef.current
			)
				return

			if (preferReducedMotion) {
				gsap.set(panelRef.current, { x: '0%' })
				gsap.set(overlayRef.current, { opacity: 1 })
				gsap.set(itemsRef.current.children, { x: 0, opacity: 1 })
				return
			}

			const tl = gsap.timeline()
			tlRef.current = tl

			gsap.set(panelRef.current, { x: '100%' })
			gsap.set(overlayRef.current, { opacity: 0 })
			gsap.set(itemsRef.current.children, { x: 0, opacity: 1 })

			tl.to(overlayRef.current, {
				opacity: 1,
				duration: 0.2,
			})
			tl.to(
				panelRef.current,
				{
					x: '0%',
					duration: 0.25,
					ease: 'power3.out',
				},
				'-=0.2'
			)
			if (!preferReducedMotion) {
				tl.to(
					itemsRef.current.children,
					{
						x: 0,
						opacity: 1,
						duration: 0.15,
						stagger: 0.02,
						ease: 'power2.out',
					},
					'-=0.15'
				)
			}
		},
		{ dependencies: [isOpen, preferReducedMotion] }
	)

	useEffect(() => {
		if (!isOpen) return
		const scrollY = window.scrollY
		document.body.style.position = 'fixed'
		document.body.style.top = `-${scrollY}px`
		document.body.style.width = '100%'
		return () => {
			document.body.style.position = ''
			document.body.style.top = ''
			document.body.style.width = ''
			window.scrollTo(0, scrollY)
		}
	}, [isOpen])

	const handleLogout = async () => {
		animateClose()
		await logoutMutation.mutateAsync(undefined)
		router.replace('/login')
	}

	const isAdminOrStaff = account?.role === 'admin' || account?.role === 'staff'

	const accountItems = [
		{ label: tNav('account'), href: '/account', icon: UserCircle },
		{ label: tNav('myTicket'), href: '/account/ticket', icon: Ticket },
		{
			label: tNav('changePassword'),
			href: '/account/change-password',
			icon: Lock,
		},
		...(account?.is_dealer
			? [{ label: tNav('myDealerBooth'), href: '/account/dealer', icon: Store }]
			: account?.is_has_ticket
				? [
						{
							label: tNav('registerDealer'),
							href: '/account/dealer/register',
							icon: Store,
						},
					]
				: []),
		...(isAdminOrStaff
			? [
					{
						label: tNav('admin'),
						href: '/admin',
						icon: Shield,
					},
				]
			: []),
	]

	if (!isOpen) return null

	const flatItems = navItems.flatMap(
		(item): (NavData & { depth?: number })[] =>
			item.children
				? [item, ...item.children.map(c => ({ ...c, depth: 1 }))]
				: [item]
	)

	return (
		<div className='fixed inset-0 z-[100]'>
			{/* Overlay */}
			<div
				ref={overlayRef}
				className='absolute inset-0 bg-black/50 backdrop-blur-sm'
				onClick={animateClose}
			/>

			{/* Panel */}
			<div
				ref={panelRef}
				className='absolute right-0 top-0 h-full w-[280px] max-w-[80vw] sm:w-[300px] lg:w-[320px] lg:max-w-[320px] bg-text-primary/95 backdrop-blur-xl shadow-2xl flex flex-col border-l border-white/10'
			>
				{/* Header */}
				<div className='flex items-center justify-between px-6 py-4 border-b border-white/15'>
					<FuveIcon black className='size-8' />
					<button
						onClick={animateClose}
						className='p-1.5 rounded-lg hover:bg-white/10 transition-colors'
						aria-label='Close menu'
					>
						<X className='size-5' />
					</button>
				</div>

				{/* Top controls */}
				<div className='flex items-center justify-center px-6 py-3 border-b border-white/15 bg-white/5'>
					<LanguageSelector />
				</div>

				{/* Nav items */}
				<nav className='flex-1 overflow-y-auto py-4'>
					<div ref={itemsRef} className='flex flex-col gap-1 px-4'>
						{/* Auth section */}
						<div className='px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-white/40'>
							{tNav('account')}
						</div>
						{isLoggedIn ? (
							<>
								{accountItems.map(item => {
									const Icon = item.icon
									const active =
										pathname === item.href ||
										(item.href !== '/account' &&
											pathname?.startsWith(item.href + '/'))
									return (
										<Link
											key={item.href}
											href={item.href}
											onClick={animateClose}
											className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
												active
													? 'bg-button/40 text-white'
													: 'text-white/75 hover:bg-white/10 hover:text-white'
											}`}
										>
											<Icon className='size-5 shrink-0' />
											<span>{item.label}</span>
										</Link>
									)
								})}

								<button
									onClick={handleLogout}
									disabled={logoutMutation.isPending}
									className='flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-300 hover:bg-red-500/15 hover:text-red-200 transition-colors w-full disabled:opacity-50'
								>
									<LogOut className='size-5' />
									<span>
										{logoutMutation.isPending
											? tAuth('loggingOut')
											: tAuth('logout')}
									</span>
								</button>
							</>
						) : (
							<>
								<Link
									href='/register'
									onClick={animateClose}
									className='flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-white/75 hover:bg-white/10 hover:text-white transition-colors'
								>
									<UserPlus className='size-5 shrink-0' />
									<span>{tAuth('register')}</span>
								</Link>
								<Link
									href='/login'
									onClick={animateClose}
									className='flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-white/75 hover:bg-white/10 hover:text-white transition-colors'
								>
									<LogIn className='size-5 shrink-0' />
									<span>{tAuth('login')}</span>
								</Link>
							</>
						)}

						<div className='my-2 border-t border-white/10' />

						{flatItems.map((item, i) => {
							if (!item.to) {
								return (
									<div
										key={`section-${i}`}
										className='px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-white/40'
									>
										{item.label}
									</div>
								)
							}

							const active = pathname === item.to

							return (
								<Link
									key={item.to}
									href={item.to}
									onClick={animateClose}
									className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
										item.depth
											? 'ml-3 text-sm text-white/65 hover:text-white'
											: 'text-white/75 hover:text-white'
									} ${
										active ? 'bg-button/40 text-white' : 'hover:bg-white/10'
									}`}
								>
									<span>{item.label}</span>
								</Link>
							)
						})}
					</div>
				</nav>
			</div>
		</div>
	)
}

export default MobileMenu

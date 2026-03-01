'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import S3Image from '@/components/common/S3Image'
import { useAuthStore } from '@/stores/authStore'
import { useLogout } from '@/hooks/services/auth/useLogout'
import { UserCircle, Ticket, Lock, Store, LogOut } from 'lucide-react'

const ProfileButton = (): React.ReactElement => {
	const t = useTranslations('auth')
	const tNav = useTranslations('nav')
	const router = useRouter()
	const pathname = usePathname()
	const account = useAuthStore(state => state.account)
	const logoutMutation = useLogout()
	const [isOpen, setIsOpen] = useState(false)
	const [imageError, setImageError] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const isAccountRoute = pathname?.startsWith('/account')

	const handleLogout = async () => {
		setIsOpen(false)
		await logoutMutation.mutateAsync(undefined)
		router.replace('/login')
	}

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const displayName = account?.fursona_name || account?.first_name || account?.email?.split('@')[0] || 'User'
	const showAvatar = account?.avatar && !imageError

	const accountNavItems = [
		{ label: tNav('account'), href: '/account', icon: UserCircle },
		{ label: tNav('myTicket'), href: '/account/ticket', icon: Ticket },
		{ label: tNav('changePassword'), href: '/account/change-password', icon: Lock },
		...(account?.is_dealer
			? [{ label: tNav('myDealerBooth'), href: '/account/dealer', icon: Store }]
			: account?.is_has_ticket
				? [{ label: tNav('registerDealer'), href: '/account/dealer/register', icon: Store }]
				: []),
	]

	return (
		<div className='relative' ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors duration-150'
				aria-label='Profile menu'
			>
				<div className='relative size-8 rounded-full overflow-hidden bg-[#154c5b] border-2 border-white/30'>
					{showAvatar && account?.avatar ? (
						<S3Image
							src={account.avatar}
							alt={displayName}
							fill
							className='object-cover'
							onError={() => setImageError(true)}
						/>
					) : (
						<div className='w-full h-full flex items-center justify-center text-white text-sm font-bold'>
							{displayName.charAt(0).toUpperCase()}
						</div>
					)}
				</div>
			</button>

			{isOpen && (
				<div className='absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50'>
					<div className='px-4 py-2 border-b border-gray-100'>
						<p className='text-sm font-medium text-[#154c5b] truncate'>{displayName}</p>
						<p className='text-xs text-gray-500 truncate'>{account?.email}</p>
					</div>

					{isAccountRoute ? (
						<div className='md:hidden'>
							{accountNavItems.map(item => {
								const Icon = item.icon
								const active = pathname === item.href || pathname?.startsWith(item.href + '/')
								return (
									<Link
										key={item.href}
										href={item.href}
										onClick={() => setIsOpen(false)}
										className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
											active
												? 'bg-[#48715B]/10 text-[#48715B] font-semibold'
												: 'text-[#154c5b] hover:bg-gray-50'
										}`}
									>
										<Icon className='size-4' />
										{item.label}
									</Link>
								)
							})}
						</div>
					) : null}

					<div className={isAccountRoute ? 'hidden md:block' : ''}>
						<Link
							href='/account'
							onClick={() => setIsOpen(false)}
							className='flex items-center gap-2 px-4 py-2 text-sm text-[#154c5b] hover:bg-gray-50 transition-colors'
						>
							<UserCircle className='size-4' />
							{tNav('account')}
						</Link>

						<Link
							href='/account/ticket'
							onClick={() => setIsOpen(false)}
							className='flex items-center gap-2 px-4 py-2 text-sm text-[#154c5b] hover:bg-gray-50 transition-colors'
						>
							<Ticket className='size-4' />
							{tNav('myTicket')}
						</Link>
					</div>

					<div className='border-t border-gray-100 mt-1 pt-1'>
						<button
							onClick={handleLogout}
							disabled={logoutMutation.isPending}
							className='flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full disabled:opacity-50'
						>
							<LogOut className='size-4' />
							{logoutMutation.isPending ? t('loggingOut') : t('logout')}
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

export default ProfileButton

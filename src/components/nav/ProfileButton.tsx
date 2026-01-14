'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { useLogout } from '@/hooks/services/auth/useLogout'

const ProfileButton = (): React.ReactElement => {
	const t = useTranslations('auth')
	const tNav = useTranslations('nav')
	const router = useRouter()
	const account = useAuthStore(state => state.account)
	const logoutMutation = useLogout()
	const [isOpen, setIsOpen] = useState(false)
	const [imageError, setImageError] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const handleLogout = () => {
		logoutMutation.mutate(undefined)
		setIsOpen(false)
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

	return (
		<div className='relative' ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors duration-150'
				aria-label='Profile menu'
			>
				<div className='relative size-8 rounded-full overflow-hidden bg-[#154c5b] border-2 border-white/30'>
					{showAvatar ? (
						<img
							src={account.avatar}
							alt={displayName}
							className='w-full h-full object-cover'
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

					<Link
						href='/account'
						onClick={() => setIsOpen(false)}
						className='flex items-center gap-2 px-4 py-2 text-sm text-[#154c5b] hover:bg-gray-50 transition-colors'
					>
						<svg className='size-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
						</svg>
						{tNav('account')}
					</Link>

					<Link
						href='/account/ticket'
						onClick={() => setIsOpen(false)}
						className='flex items-center gap-2 px-4 py-2 text-sm text-[#154c5b] hover:bg-gray-50 transition-colors'
					>
						<svg className='size-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' />
						</svg>
						{tNav('myTicket')}
					</Link>

					<div className='border-t border-gray-100 mt-1 pt-1'>
						<button
							onClick={handleLogout}
							disabled={logoutMutation.isPending}
							className='flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full disabled:opacity-50'
						>
							<svg className='size-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
							</svg>
							{logoutMutation.isPending ? t('loggingOut') : t('logout')}
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

export default ProfileButton

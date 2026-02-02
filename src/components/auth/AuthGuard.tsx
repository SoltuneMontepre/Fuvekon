'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import Loading from '@/components/common/Loading'

type AuthGuardProps = {
	children: ReactNode
	/** Where to redirect when not authenticated. Default: /login */
	redirectTo?: string
}

/**
 * Wraps content that requires the user to be logged in.
 * Redirects to login if not authenticated (after client hydration and persist rehydration).
 */
export default function AuthGuard({
	children,
	redirectTo = '/login',
}: AuthGuardProps) {
	const router = useRouter()
	const isAuthenticated = useAuthStore(state => state.isAuthenticated)
	const [hasChecked, setHasChecked] = useState(false)

	useEffect(() => {
		// Give persist time to rehydrate from localStorage before redirecting
		const t = setTimeout(() => {
			setHasChecked(true)
		}, 50)
		return () => clearTimeout(t)
	}, [])

	useEffect(() => {
		if (!hasChecked) return
		if (!isAuthenticated) {
			router.replace(redirectTo)
		}
	}, [hasChecked, isAuthenticated, redirectTo, router])

	// Before we've confirmed auth state, or if not authenticated (redirecting), show loading
	if (!hasChecked || !isAuthenticated) {
		return <Loading />
	}

	return <>{children}</>
}

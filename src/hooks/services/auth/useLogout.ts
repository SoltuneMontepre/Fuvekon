'use client'

import { useMutation } from '@tanstack/react-query'
import axios from '@/common/axios'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'

export function useLogout() {
	const { clearAuth } = useAuthStore()
	const router = useRouter()

	return useMutation({
		mutationFn: async () => {
			const { data } = await axios.post('/auth/logout')
			return data
		},
		onSuccess: () => {
			// Clear user data and token from store
			clearAuth()
			// Redirect to home page
			router.push('/')
		},
		onError: (error: Error) => {
			console.error('Logout failed:', error.message)
			// Still clear auth state even if backend call fails
			clearAuth()
			router.push('/')
		},
	})
}

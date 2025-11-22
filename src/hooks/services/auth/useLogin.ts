'use client'

import { useMutation } from '@tanstack/react-query'
import axios from '@/common/axios'
import { useAuthStore } from '@/stores/authStore'
import type { LoginResponse, LoginRequest } from '@/types/api/auth/login'

interface MeResponse {
	isSuccess: boolean
	data: {
		id: string
		fursona_name: string
		last_name: string
		first_name: string
		country: string
		email: string
		avatar: string
		role: string
		is_verified: boolean
		created_at: string
		modified_at: string
	}
}

export function useLogin() {
	const { setUser, setToken, setLoading } = useAuthStore()

	return useMutation({
		mutationFn: async (payload: LoginRequest) => {
			const { data } = await axios.post<LoginResponse>('/auth/login', payload)
			return data
		},
		onMutate: () => {
			setLoading(true)
		},
		onSuccess: async (data) => {
			// Store the token from the response for Authorization header
			if (data.isSuccess && data.data?.access_token) {
				setToken(data.data.access_token)
				console.log('Login successful, token stored for Authorization header')
			}

			try {
				// Fetch user data immediately after login
				const { data: userData } = await axios.get<MeResponse>('/users/me')
				if (userData.isSuccess) {
					setUser(userData.data)
				}
			} catch (error) {
				console.error('Failed to fetch user data after login:', error)
				// Don't fail login if user data fetch fails
			}
		},
		onSettled: () => {
			setLoading(false)
		},
		onError: (error: Error) => {
			console.error('Login failed:', error.message)
			setLoading(false)
		},
	})
}

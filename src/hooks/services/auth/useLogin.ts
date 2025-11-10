'use client'

import { useMutation } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { LoginResponse, LoginRequest } from '@/types/api/auth/login'

export function useLogin() {
	return useMutation({
		mutationFn: async (payload: LoginRequest) => {
			const { data } = await axios.post<LoginResponse>('/auth/login', payload)
			return data
		},
		onSuccess: data => {
			// Cookie will be set automatically by the backend with httpOnly and secure flags
			console.log('Login successful:', data.message)
			// Optionally redirect or update application state here
		},
		onError: (error: Error) => {
			console.error('Login failed:', error.message)
		},
	})
}

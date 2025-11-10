'use client'

import { useMutation } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { LoginResponse, LoginRequest } from '@/types/api/auth/login.ts'

export function useLogin() {
	return useMutation({
		mutationFn: async (payload: LoginRequest) => {
			const { data } = await axios.post<LoginResponse>('/auth/login', payload)
			return data
		},
		onSuccess: data => {
			// Cookie sẽ được set tự động từ BE với httpOnly và secure flag
			console.log('Login successful:', data.message)
			// Có thể redirect hoặc update state ở đây
		},
		onError: (error: Error) => {
			console.error('Login failed:', error.message)
		},
	})
}

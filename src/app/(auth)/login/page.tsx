'use client'
import LoginForm from '@/components/auth/login/LoginForm'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

const LoginPage = () => {
	const isLoggedIn = useAuthStore(state => state.isAuthenticated)
	const navigate = useRouter()

	useEffect(() => {
		if (isLoggedIn) {
			navigate.replace('/account')
		}
	}, [isLoggedIn, navigate])

	if (isLoggedIn) {
		return null
	}

	return <LoginForm />
}

export default LoginPage

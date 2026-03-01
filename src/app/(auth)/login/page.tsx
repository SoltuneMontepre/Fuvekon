'use client'
import LoginForm from '@/components/auth/login/LoginForm'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import React from 'react'

const LoginPage = () => {
	const isLoggedIn = useAuthStore(state => state.isAuthenticated)
	const navigate = useRouter()

	if (isLoggedIn) {
		navigate.replace('/account')
		return <div className='text-red-600'>You are already logged in.</div>
	}

	return <LoginForm />
}

export default LoginPage

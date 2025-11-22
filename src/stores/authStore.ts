import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
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

interface AuthState {
	user: User | null
	token: string | null
	isAuthenticated: boolean
	isLoading: boolean
	setUser: (user: User | null) => void
	setToken: (token: string | null) => void
	setLoading: (loading: boolean) => void
	clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			token: null,
			isAuthenticated: false,
			isLoading: false,
			setUser: (user) => set({
				user,
				isAuthenticated: user !== null
			}),
			setToken: (token) => set({ token }),
			setLoading: (loading) => set({ isLoading: loading }),
			clearAuth: () => set({
				user: null,
				token: null,
				isAuthenticated: false,
				isLoading: false
			}),
		}),
		{
			name: 'auth-storage',
			partialize: (state) => ({
				user: state.user,
				token: state.token,
				isAuthenticated: state.isAuthenticated
			}),
		}
	)
)

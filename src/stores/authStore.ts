import { create } from 'zustand'
import type { Account } from '@/types/models/auth/account'

export type AuthState = {
	account: Account | null
	isAuthenticated: boolean
}

export type AuthActions = {
	setAccount: (account: Account | null) => void
	clearAccount: () => void
}

export type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>(set => ({
	account: null,
	isAuthenticated: false,
	setAccount: (account: Account | null) =>
		set({ account, isAuthenticated: account !== null }),
	clearAccount: () => set({ account: null, isAuthenticated: false }),
}))

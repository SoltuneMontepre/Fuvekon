import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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

export const useAuthStore = create<AuthStore>()(
	persist(
		set => ({
			account: null,
			isAuthenticated: false,
			setAccount: (account: Account | null) =>
				set({ account, isAuthenticated: account !== null }),
			clearAccount: () => set({ account: null, isAuthenticated: false }),
		}),
		{
			name: 'auth-storage',
			storage: createJSONStorage(() => localStorage),
		}
	)
)

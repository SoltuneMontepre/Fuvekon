import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Account } from '@/types/models/auth/account'

/**
 * Fields safe to persist in localStorage. Sensitive PII (id_card, date_of_birth,
 * first_name, last_name, country) is intentionally excluded — it lives only in
 * memory and is fetched fresh from /users/me on each session.
 */
type SafeAccount = Pick<
	Account,
	'id' | 'email' | 'role' | 'fursona_name' | 'avatar' | 'is_verified' | 'is_dealer' | 'is_has_ticket' | 'is_blacklisted'
>

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
			partialize: (state): { account: SafeAccount | null; isAuthenticated: boolean } => ({
				isAuthenticated: state.isAuthenticated,
				account: state.account
					? {
							id: state.account.id,
							email: state.account.email,
							role: state.account.role,
							fursona_name: state.account.fursona_name,
							avatar: state.account.avatar,
							is_verified: state.account.is_verified,
							is_dealer: state.account.is_dealer,
							is_has_ticket: state.account.is_has_ticket,
							is_blacklisted: state.account.is_blacklisted,
						}
					: null,
			}),
		}
	)
)

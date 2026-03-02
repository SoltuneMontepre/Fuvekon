import { createStore } from 'zustand/vanilla'

export type Theme = 'light' | 'dark' | 'system'

export type ThemeState = {
	theme: Theme
	prefersReducedMotion: boolean
}

export type ThemeActions = {
	setTheme: (theme: Theme) => void
	toggleTheme: () => void
	setPrefersReducedMotion: (value: boolean) => void
}

export type ThemeStore = ThemeState & ThemeActions

export const defaultInitState: ThemeState = {
	theme: 'system',
	prefersReducedMotion: false,
}

// Get the actual theme to apply (resolves 'system' to 'light' or 'dark')
export const getResolvedTheme = (theme: Theme): 'light' | 'dark' => {
	if (theme === 'system') {
		if (typeof window !== 'undefined') {
			return window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light'
		}
		return 'light'
	}
	return theme
}

export const initThemeStore = (): ThemeState => {
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem('theme-storage')

		// If localStorage has data, always use it (don't fallback to browser detection)
		if (stored) {
			try {
				const parsedData = JSON.parse(stored)
				// Get theme (validate it)
				let theme: Theme = defaultInitState.theme
				if (
					parsedData.theme === 'light' ||
					parsedData.theme === 'dark' ||
					parsedData.theme === 'system'
				) {
					theme = parsedData.theme
				}
				// Always use the stored value, fallback to default if not present
				const prefersReducedMotion =
					parsedData.prefersReducedMotion !== undefined
						? parsedData.prefersReducedMotion
						: defaultInitState.prefersReducedMotion
				return { theme, prefersReducedMotion }
			} catch {
				// If parsing fails, return defaults (don't use browser detection as fallback)
				return defaultInitState
			}
		}

		// Only use browser detection if localStorage is completely empty
		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches
		return { ...defaultInitState, prefersReducedMotion }
	}
	return defaultInitState
}

export const createThemeStore = (initState: ThemeState = defaultInitState) => {
	return createStore<ThemeStore>()(set => ({
		...initState,
		setTheme: theme => {
			set({ theme })
			// Persist to localStorage
			if (typeof window !== 'undefined') {
				const currentState = JSON.parse(
					localStorage.getItem('theme-storage') || '{}'
				)
				localStorage.setItem(
					'theme-storage',
					JSON.stringify({ ...currentState, theme })
				)
			}
		},
		toggleTheme: () => {
			set(state => {
				const newTheme = state.theme === 'dark' ? 'light' : 'dark'
				// Persist to localStorage
				if (typeof window !== 'undefined') {
					const currentState = JSON.parse(
						localStorage.getItem('theme-storage') || '{}'
					)
					localStorage.setItem(
						'theme-storage',
						JSON.stringify({ ...currentState, theme: newTheme })
					)
				}
				return { theme: newTheme }
			})
		},
		setPrefersReducedMotion: value => {
			set({ prefersReducedMotion: value })
			if (typeof window !== 'undefined') {
				const currentState = JSON.parse(
					localStorage.getItem('theme-storage') || '{}'
				)
				localStorage.setItem(
					'theme-storage',
					JSON.stringify({ ...currentState, prefersReducedMotion: value })
				)
			}
		},
	}))
}

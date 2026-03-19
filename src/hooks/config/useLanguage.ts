'use client'
import { Language, SUPPORTED_LANGS } from '@/common/language'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const useLanguage = (serverLocale: Language = 'vi') => {
	const [locale, setLocale] = useState<Language>(serverLocale)
	const router = useRouter()
	// Persist locale on the client so URLs do not need `?lang=` params.
	const LOCALE_STORAGE_KEY = 'locale-storage'

	useEffect(() => {
		const cookieLocale = document.cookie
			.split('; ')
			.find(row => row.startsWith('locale='))
			?.split('=')[1] as Language | undefined

		let localStorageLocale: Language | null | undefined
		try {
			localStorageLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as
				| Language
				| null
		} catch {
			// localStorage can be unavailable in some environments.
			localStorageLocale = undefined
		}

		const navigatorLocale = navigator.language.slice(0, 2) as Language

		const resolvedLocale: Language =
			(localStorageLocale && SUPPORTED_LANGS.includes(localStorageLocale)
				? localStorageLocale
				: cookieLocale && SUPPORTED_LANGS.includes(cookieLocale)
					? cookieLocale
					: SUPPORTED_LANGS.includes(navigatorLocale)
						? navigatorLocale
						: 'vi') as Language

		// Keep the cookie in sync for server-side rendering / next-intl.
		if (!cookieLocale || cookieLocale !== resolvedLocale) {
			document.cookie = `locale=${resolvedLocale}; path=/; max-age=31536000`
		}

		setLocale(resolvedLocale)
		// Refresh so next-intl server-side translations pick up the new cookie.
		router.refresh()
	// serverLocale is only used for initial state; updates come from storage/cookie.
	}, [router])

	const changeLanguage = (newLocale: Language) => {
		if (SUPPORTED_LANGS.includes(newLocale)) {
			setLocale(newLocale)

			try {
				localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
			} catch {
				// ignore
			}

			// Keep cookie in sync for next-intl on the server.
			document.cookie = `locale=${newLocale}; path=/; max-age=31536000`
			router.refresh()
			return
		}
	}

	return { locale, changeLanguage }
}

export default useLanguage

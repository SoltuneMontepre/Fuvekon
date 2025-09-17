import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'
import en from '../languages/en/en'
import vi from '../languages/vi/vi'

const resources = {
	en,
	vi,
}

i18n
	.use(I18nextBrowserLanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		supportedLngs: ['vi', 'en'],
		fallbackLng: 'en',
		detection: {
			order: ['localStorage', 'navigator'],
			caches: ['localStorage'],
			lookupLocalStorage: 'i18nextLng',
		},
		interpolation: {
			escapeValue: false,
		},
		react: {
			useSuspense: false,
		},
	})

export default i18n

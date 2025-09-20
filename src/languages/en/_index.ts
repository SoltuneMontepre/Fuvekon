import type { Translation } from '..'
import commonTranslations from './common'
import landingTranslations from './landing'
import navTranslations from './nav'

const en: Translation = {
	translation: {
		...commonTranslations,
		...landingTranslations,
		...navTranslations,
	},
}

export default en

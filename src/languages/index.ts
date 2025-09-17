import en from './en/en'
import vi from './vi/vi'

const resources = {
	en,
	vi,
}

export { resources }
export type Translation = { translation: { [key: string]: string } }
export type Language = keyof typeof resources

import en from './en/_index'
import vi from './vi/_index'

const resources = {
	en,
	vi,
}

export { resources }
export type Translation = { translation: { [key: string]: string } }
export type Language = keyof typeof resources

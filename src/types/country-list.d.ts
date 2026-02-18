declare module 'country-list' {
	export function getNames(): string[]
	export function getCodes(): string[]
	export function getName(code: string): string
	export function getCode(name: string): string
}

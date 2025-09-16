import { createBrowserRouter } from 'react-router'
import type { ComponentType } from 'react'
import React from 'react'

type PageModule = { default: ComponentType<Record<string, unknown>> }

const pages = import.meta.glob('../pages/**/page.tsx', { eager: true })
const layouts = import.meta.glob('../pages/**/layout.tsx', { eager: true })

const getRoutePath = (filename: string) => {
	let name = filename.replace(/^\.\.\/pages\//, '').replace(/\.tsx$/, '')
	name = name.replace(/\[(.+?)\]/g, ':$1')
	name = name.replace(/\/?\(([^)]+)\)/g, '')
	name = name.replace(/^\/+/, '')
	if (name === 'page') return '/'
	if (name.endsWith('/page'))
		return `/${name.replace('/page', '')}`.length
			? `/${name.replace('/page', '')}`
			: '/'
	return `/${name}`
}

const getNearestLayout = (filename: string) => {
	const folder = filename.replace(/^\.\.\/pages\//, '')
	const parts = folder.split('/')

	parts.pop()

	while (parts.length > 0) {
		const layoutPath = `../pages/${parts.join('/')}/layout.tsx`
		if (layouts[layoutPath]) {
			return layouts[layoutPath] as PageModule
		}
		parts.pop()
	}

	if (layouts['../pages/layout.tsx']) {
		return layouts['../pages/layout.tsx'] as PageModule
	}

	return null
}

const routesMap = new Map<
	string,
	{ element: React.JSX.Element; filename: string }
>()

Object.entries(pages).forEach(([filename, mod]) => {
	const component = mod as PageModule
	const Comp = component.default
	const Layout = getNearestLayout(filename)?.default

	const element = Layout ? (
		<Layout>
			<Comp />
		</Layout>
	) : Comp ? (
		<Comp />
	) : (
		<div>Missing Page</div>
	)

	const path = getRoutePath(filename)

	const existing = routesMap.get(path)

	if (!existing) {
		routesMap.set(path, { element, filename })
	} else
		throw new Error(
			`Duplicate route path: ${path} \nat ${filename} \nand ${existing.filename}`
		)
})

const routes = Array.from(routesMap.entries()).map(([path, { filename }]) => ({
	path,
	lazy: {
		Component: async () =>
			(await import(/* @vite-ignore */ `../pages/${filename}`)).default,
	},
}))

const router = createBrowserRouter(routes, {
	future: { v7_startTransition: true },
})

export default router

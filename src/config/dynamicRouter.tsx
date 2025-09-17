import { createBrowserRouter } from 'react-router'
import type { ComponentType } from 'react'

type PageModule = { default: ComponentType<Record<string, unknown>> }
type GlobImport = Record<string, () => Promise<PageModule>>

const pageLoaders = import.meta.glob('../pages/**/page.tsx') as GlobImport
const layoutLoaders = import.meta.glob('../pages/**/layout.tsx') as GlobImport

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

const findNearestLayoutKey = (filename: string) => {
	const folder = filename.replace(/^\.\.\/pages\//, '')
	const parts = folder.split('/')

	parts.pop()

	while (parts.length > 0) {
		const layoutPath = `../pages/${parts.join('/')}/layout.tsx`
		if (layoutLoaders[layoutPath]) {
			return layoutPath
		}
		parts.pop()
	}

	if (layoutLoaders['../pages/layout.tsx']) {
		return '../pages/layout.tsx'
	}

	return null
}

const routesMap = new Map<
	string,
	{ pageKey: string; layoutKey: string | null }
>()

Object.keys(pageLoaders).forEach(pageKey => {
	const path = getRoutePath(pageKey)
	const existing = routesMap.get(path)

	if (!existing) {
		const layoutKey = findNearestLayoutKey(pageKey)
		routesMap.set(path, { pageKey, layoutKey })
	} else {
		throw new Error(
			`Duplicate route path: ${path} \nat ${pageKey} \nand ${existing.pageKey}`
		)
	}
})

const routes = Array.from(routesMap.entries()).map(
	([path, { pageKey, layoutKey }]) => ({
		path,
		lazy: {
			Component: async () => {
				const pageMod = await pageLoaders[pageKey]()
				const Page = pageMod.default

				if (layoutKey) {
					const layoutMod = await layoutLoaders[layoutKey]()
					const Layout = layoutMod.default

					return () => (
						<Layout>
							<Page />
						</Layout>
					)
				}

				return Page
			},
		},
	})
)

console.log(routes)

const router = createBrowserRouter(routes, {
	future: { v7_startTransition: true },
})

export default router

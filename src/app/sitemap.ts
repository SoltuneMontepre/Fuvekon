import type { MetadataRoute } from 'next'

const baseUrl = 'https://fuve.vn'

const staticRoutes = [
	'',
	'/ticket',
	'/talent',
	'/panel',
	'/volunteer',
	'/artbook',
	'/dealer',
	'/schedule',
	'/about',
	'/tos',
] as const

export default function sitemap(): MetadataRoute.Sitemap {
	return staticRoutes.map(path => ({
		url: path ? `${baseUrl}${path}` : `${baseUrl}/`,
		lastModified: new Date(),
		changeFrequency: 'weekly' as const,
		priority: path ? 0.8 : 1,
	}))
}

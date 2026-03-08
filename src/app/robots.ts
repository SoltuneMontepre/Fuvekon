import type { MetadataRoute } from 'next'

const baseUrl = 'https://fuve.vn'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: [
					'/account/',
					'/admin/',
					'/login',
					'/register',
					'/reset-password',
					'/forgot-password',
				],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	}
}

import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
const withNextIntl = createNextIntlPlugin('./src/config/language.ts')

/**
 * @type {import('next').NextConfig}
 */
const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'via.placeholder.com',
			},
		],
	},
	async rewrites() {
		const apiBase = 'https://api.fuve.vn'
		// Only proxy backend API routes; /api/s3/* (image signing, presign) stay as Next.js API routes
		return [
			{ source: '/api/general/:path*', destination: `${apiBase}/api/general/:path*` },
			{ source: '/api/ticket/:path*', destination: `${apiBase}/api/ticket/:path*` },
		]
	},
}

export default withNextIntl(nextConfig)

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
		const apiGateway = 'https://riw96amgn7.execute-api.ap-southeast-1.amazonaws.com'
		// Only proxy backend API routes; /api/s3/* (image signing, presign) stay as Next.js API routes
		return [
			{ source: '/api/general/:path*', destination: `${apiGateway}/api/general/:path*` },
			{ source: '/api/ticket/:path*', destination: `${apiGateway}/api/ticket/:path*` },
		]
	},
}

export default withNextIntl(nextConfig)

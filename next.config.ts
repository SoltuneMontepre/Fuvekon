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
		return [
			{
				source: '/api/:path*',
				destination: 'https://riw96amgn7.execute-api.ap-southeast-1.amazonaws.com/:path*',
			},
		]
	},
}

export default withNextIntl(nextConfig)

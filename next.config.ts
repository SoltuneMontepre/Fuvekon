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
	devIndicators: false,
	// Tree-shake icon libraries so only used icons are bundled
	experimental: {
		optimizePackageImports: ['lucide-react', 'react-icons'],
	},
}

export default withNextIntl(nextConfig)

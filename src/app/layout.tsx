import type { Metadata } from 'next'
import { Geist_Mono, Inter, Montserrat } from 'next/font/google'
import { getLocale, getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import NavBar from '@/components/nav/NavBar'
import ScrollProgressBar from '@/components/common/ScrollProgressBar'
import TanstackProvider from '@/config/Providers/TanstackProvider'

import ThemeProvider from '@/config/Providers/ThemeProvider'
import ThemePreload from '@/config/Providers/ThemePreload'
import ToastProvider from '@/components/common/ToastProvider'

import './globals.css'

const siteUrl = 'https://fuve.vn'

const siteDescription =
	'FUVE – Furry Vietnam Eternity is a furry convention held in Ho Chi Minh City, Vietnam, starting from 2022. The event is built with the goal of creating a welcoming space for the furry community to meet, connect, and celebrate together.\n\nFUVE aims to foster a friendly, open environment where everyone can connect, share their passions, and create unforgettable memories side by side.\n\nJoin FUVE to immerse yourself in vibrant experiences, explore exciting activities, panels, the dealer’s den, and many other highlights from the Vietnamese furry community.'

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: 'FUVE – Furry Vietnam Eternity',
		template: '%s | Fuve',
	},
	description: siteDescription,
	keywords: [
		'FUVE',
		'Furry Vietnam Eternity',
		'Furry Vietnam',
		'Vietnam',
		'Ho Chi Minh City',
		'Vietnam furry',
		'furry convention',
		'event',
		'tickets',
		'schedule',
		'talent',
		'panel',
		'volunteer',
		'artbook',
		'dealer',
	],
	authors: [{ name: 'Fuve', url: siteUrl }],
	creator: 'Fuve',
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: siteUrl,
		siteName: 'Fuve',
		title: 'FUVE – Furry Vietnam Eternity',
		description: siteDescription,
		images: [
			{
				url: '/assets/theme-title.webp',
				width: 1200,
				height: 630,
				alt: 'Fuve — Furry Vietnam Eternity',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'FUVE – Furry Vietnam Eternity',
		description: siteDescription,
		images: ['/assets/theme-title.webp'],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
		},
	},
	alternates: {
		canonical: siteUrl,
	},
	verification: {
		google: 'qKdVCmJloKZISqsMlZ9Tbg_4fzawV1g8bPuh8xyt0a8',
	},
}

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
	display: 'swap',
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
	display: 'swap',
})

const montserrat = Montserrat({
	variable: '--font-montserrat',
	subsets: ['latin'],
	display: 'swap',
})

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const messages = await getMessages()
	const locale = await getLocale()

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'Fuve',
		url: siteUrl,
		description: siteDescription,
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${siteUrl}/ticket?search={search_term_string}`,
			},
			'query-input': 'required name=search_term_string',
		},
	}

	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<ThemePreload />
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			</head>
			<body
				className={`${inter.variable} ${montserrat.variable} ${geistMono.variable} antialiased md:overflow-x-auto overflow-x-hidden bg-main dark:bg-dark-bg text-[#48715B] dark:text-dark-text`}
			>
				<ThemeProvider>
					<TanstackProvider>
						<NextIntlClientProvider locale={locale} messages={messages}>
							<ScrollProgressBar />
							<ToastProvider />
							<NavBar />
							<main>{children}</main>
						</NextIntlClientProvider>
					</TanstackProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}

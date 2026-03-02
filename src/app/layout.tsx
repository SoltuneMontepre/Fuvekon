import type { Metadata } from 'next'
import { Geist_Mono, Inter, Montserrat } from 'next/font/google'
import { getLocale, getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import NavBar from '@/components/nav/NavBar'
import TanstackProvider from '@/config/Providers/TanstackProvider'

import ThemeProvider from '@/config/Providers/ThemeProvider'
import ThemePreload from '@/config/Providers/ThemePreload'
import ToastProvider from '@/components/common/ToastProvider'

import './globals.css'

const siteUrl = 'https://fuve.vn'

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: 'Fuve | Furry Vietnam Eternity',
		template: '%s | Fuve',
	},
	description:
		'Fuve — Furry Vietnam Eternity. Get event tickets, view the schedule, and join the community. Contribute as talent, panelist, volunteer, artbook, or dealer.',
	keywords: [
		'Fuve',
		'Furry Vietnam Eternity',
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
		title: 'Fuve | Furry Vietnam Eternity',
		description:
			'Furry Vietnam Eternity. Get event tickets, view the schedule, and join the community. Talent, panel, volunteer, artbook, dealer.',
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
		title: 'Fuve | Furry Vietnam Eternity',
		description:
			'Furry Vietnam Eternity. Get event tickets, view the schedule, and join the community.',
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
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

const montserrat = Montserrat({
	variable: '--font-montserrat',
	subsets: ['latin'],
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
		description:
			'Fuve — Furry Vietnam Eternity. Get event tickets, view the schedule, and join the community.',
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

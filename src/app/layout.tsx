import type { Metadata } from 'next'
import { Geist_Mono, Inter, Montserrat } from 'next/font/google'
import { getLocale, getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import NavBar from '@/components/nav/NavBar'
import TanstackProvider from '@/config/Providers/TanstackProvider'

import ThemeProvider from '@/config/Providers/ThemeProvider'
import ThemePreload from '@/config/Providers/ThemePreload'

import './globals.css'
import Background from '@/components/landing/hero_section/Background'

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

export const metadata: Metadata = {}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const messages = await getMessages()
	const locale = await getLocale()

	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<ThemePreload />
			</head>
			<body
				className={`${inter.variable} ${montserrat.variable} ${geistMono.variable} antialiased bg-main dark:bg-dark-bg text-[#48715B] dark:text-dark-text`}
			>
				<ThemeProvider>
					<TanstackProvider>
						<NextIntlClientProvider locale={locale} messages={messages}>
							<NavBar />
							<main>{children}</main>
							<div className='fixed w-dvw flex h-dvh top-0 mx-auto -z-10 overflow-hidden center-width-cap select-none'>
								<Background />
							</div>
						</NextIntlClientProvider>
					</TanstackProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}

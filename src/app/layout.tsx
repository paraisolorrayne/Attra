import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ToastProvider } from '@/components/ui/toast'
import { VisitorTrackingProvider } from '@/components/providers/visitor-tracking-provider'
import { AnalyticsProvider, AnalyticsNoScript } from '@/components/analytics'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Attra Veículos - Carros Premium em Uberlândia',
    template: '%s | Attra Veículos',
  },
  description:
    'Referência em veículos nacionais, importados, seminovos e supercarros em Uberlândia. Porsche, BMW, Mercedes-Benz, Audi, Land Rover e mais. Atendimento nacional.',
  keywords: [
    'carros premium',
    'veículos importados',
    'supercarros',
    'Uberlândia',
    'Porsche',
    'BMW',
    'Mercedes-Benz',
    'Audi',
    'Land Rover',
    'concessionária',
  ],
  authors: [{ name: 'Attra Veículos' }],
  creator: 'Attra Veículos',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://attraveiculos.com.br',
    siteName: 'Attra Veículos',
    title: 'Attra Veículos - Carros Premium em Uberlândia',
    description:
      'Referência em veículos nacionais, importados, seminovos e supercarros em Uberlândia.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Attra Veículos - Carros Premium em Uberlândia',
    description:
      'Referência em veículos nacionais, importados, seminovos e supercarros em Uberlândia.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Analytics scripts loaded in head for optimal tracking */}
        <AnalyticsProvider />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* GTM NoScript fallback for users without JavaScript */}
        <AnalyticsNoScript />
        <ThemeProvider>
          <ToastProvider>
            <Suspense fallback={null}>
              <VisitorTrackingProvider>
                {children}
              </VisitorTrackingProvider>
            </Suspense>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

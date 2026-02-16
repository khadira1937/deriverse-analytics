import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'

import './globals.css'
import { AppProvider } from '@/lib/context/app-context'
import { Header } from '@/components/layout/header'
import { GridBackground } from '@/components/layout/grid-background'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Derivision | Deriverse Trading Analytics',
  description: 'Professional trading journal + performance analytics for Deriverse on Solana',
  generator: 'v0.app',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2300ffff"><circle cx="12" cy="12" r="10" opacity="0.3"/><circle cx="12" cy="12" r="6"/></svg>',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased dark`}>
        <AppProvider>
          <GridBackground />
          <div className="relative z-10 min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster theme="dark" position="bottom-right" />
        </AppProvider>
      </body>
    </html>
  )
}

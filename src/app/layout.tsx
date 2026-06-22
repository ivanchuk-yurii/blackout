export const dynamic = 'force-dynamic'

import type { Metadata, Viewport } from 'next'
import './globals.css'
import { UserProvider } from '@/context/UserContext'

export const metadata: Metadata = {
  title: "Don't Blackout",
  description: 'Track your night out with friends',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: "Don't Blackout",
  },
}

export const viewport: Viewport = {
  themeColor: '#080812',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <main className="min-h-dvh max-w-md mx-auto px-4 pb-8">
            {children}
          </main>
        </UserProvider>
      </body>
    </html>
  )
}

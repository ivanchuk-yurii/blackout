import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { RegisterServiceWorker } from './register-service-worker';
import { Toaster } from '@/components/ui/toast';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Blackout',
  description: 'Track hangouts, drinks and spots with your buddies.',
  appleWebApp: {
    capable: true,
    title: 'Blackout',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-dvh overscroll-none bg-background">
        <Toaster>
          <div className="mx-auto flex min-h-dvh w-full max-w-[500px] flex-col">
            {children}
          </div>
        </Toaster>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}

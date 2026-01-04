import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { PWAProvider } from '@/components/providers/PWAProvider';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SpendWise - Track Your Expenses',
  description: 'Simple expense tracking to stay within your budget',
  applicationName: 'SpendWise',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SpendWise',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <PWAProvider />
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

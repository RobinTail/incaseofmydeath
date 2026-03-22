import type { Metadata, Viewport } from 'next'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from '../theme'
import '@fontsource/material-symbols-outlined'
import './globals.css'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export const metadata: Metadata = {
  title: 'In Case of My Death',
  description: 'GitHub Workflow as a Last Will',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo192.png',
  },
  openGraph: {
    title: 'In Case of My Death',
    description: 'GitHub Workflow as a Last Will',
    images: [
      {
        url: '/logo.png',
        width: 1280,
        height: 640,
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme} disableTransitionOnChange>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}

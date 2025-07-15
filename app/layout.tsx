import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from './context/theme-context'

export const metadata: Metadata = {
  title: 'AI4PRO Dashboard',
  description: 'Professional AI-powered business management dashboard',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

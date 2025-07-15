/**
 * Root Layout Component
 * 
 * This is the main layout component that wraps the entire Next.js application.
 * It provides:
 * - Global CSS imports and styling
 * - Theme context for light/dark mode and glass/simple UI styles
 * - Subscription context for managing user subscription state
 * - HTML document structure with proper metadata
 */

import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from './context/theme-context'
import { SubscriptionProvider } from './context/subscription-context'

/**
 * Application metadata configuration
 * Used by Next.js for SEO and browser tab information
 */
export const metadata: Metadata = {
  title: 'AI4PRO Dashboard',
  description: 'Professional AI-powered business management dashboard',
  generator: 'Next.js',
}

/**
 * Root Layout Component
 * 
 * Wraps the entire application with necessary providers and base HTML structure.
 * The layout includes:
 * - suppressHydrationWarning: Prevents hydration warnings during SSR
 * - Theme provider: Manages light/dark mode and glass/simple UI styles
 * - Subscription provider: Handles user subscription state and trial management
 * - Smooth color transitions for theme switching
 * 
 * @param children - The page content to be rendered within this layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="transition-colors duration-300">
        <ThemeProvider>
          <SubscriptionProvider>
            {children}
          </SubscriptionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

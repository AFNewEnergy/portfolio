import type { ReactNode } from 'react'
import './globals.css'

/**
 * Root layout is intentionally minimal — <html> and <body> are emitted by
 * the [locale] layout, which is the only place that knows lang and dir.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}

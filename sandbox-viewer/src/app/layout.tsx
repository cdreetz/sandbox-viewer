import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sandbox Viewer',
  description: 'View sandbox runs and rollouts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

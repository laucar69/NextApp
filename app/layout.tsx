import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Roadhouse',
  description: 'Hello World starter for the new Roadhouse website.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}

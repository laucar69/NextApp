import type { Metadata } from 'next'
import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'
import './admin.css'

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

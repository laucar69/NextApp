import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Roadhouse - the band',
  description: '... good old rock ...',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}

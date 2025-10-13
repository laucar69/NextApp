import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Hello Master</h1>
      <Link href="/datetime">Next Step</Link>
    </main>
  )
}

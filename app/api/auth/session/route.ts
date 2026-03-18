import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookieName, verifySessionToken } from '@/lib/auth'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(getAuthCookieName())?.value
  const session = verifySessionToken(token)

  return NextResponse.json({
    ok: true,
    authenticated: Boolean(session),
    user: session ? { uid: session.uid } : null,
  })
}

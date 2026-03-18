import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { dbConnect } from '@/lib/mongodb'
import { createSessionToken, getAuthCookieName } from '@/lib/auth'
import User from '@/models/User'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const uid = typeof body.uid === 'string' ? body.uid.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!uid || !password) {
      return NextResponse.json(
        { ok: false, error: 'Bitte User ID und Passwort eingeben.' },
        { status: 400 }
      )
    }

    await dbConnect()

    const user = await User.findOne({ uid }).lean()

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Ungültige Zugangsdaten.' },
        { status: 401 }
      )
    }

    const passwordMatches = await bcrypt.compare(password, user.pw)

    if (!passwordMatches) {
      return NextResponse.json(
        { ok: false, error: 'Ungültige Zugangsdaten.' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        uid: user.uid,
      },
    })

    response.cookies.set({
      name: getAuthCookieName(),
      value: createSessionToken(user.uid),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 12,
    })

    return response
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown login error',
      },
      { status: 500 }
    )
  }
}

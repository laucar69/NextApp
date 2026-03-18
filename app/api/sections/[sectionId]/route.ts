import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookieName, verifySessionToken } from '@/lib/auth'
import { dbConnect } from '@/lib/mongodb'
import { updateSectionName } from '@/lib/site-structure'

async function requireSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(getAuthCookieName())?.value
  const session = verifySessionToken(token)

  if (!session) {
    return NextResponse.json(
      { ok: false, error: 'Nicht autorisiert.' },
      { status: 401 }
    )
  }

  return null
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ sectionId: string }> }
) {
  const unauthorizedResponse = await requireSession()

  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    await dbConnect()

    const body = await request.json()
    const params = await context.params
    const sectionId = Number(params.sectionId)
    const name = typeof body.name === 'string' ? body.name.trim() : ''

    if (Number.isNaN(sectionId)) {
      return NextResponse.json(
        { ok: false, error: 'Section id ist ungueltig.' },
        { status: 400 }
      )
    }

    const sections = await updateSectionName(sectionId, name)

    return NextResponse.json({
      ok: true,
      sections,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown sections error',
      },
      { status: 500 }
    )
  }
}

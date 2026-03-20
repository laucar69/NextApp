import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookieName, verifySessionToken } from '@/lib/auth'
import { dbConnect } from '@/lib/mongodb'
import { addModuleToSection, reorderModulesForSection } from '@/lib/site-structure'

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  const unauthorizedResponse = await requireSession()

  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    await dbConnect()

    const { sectionId } = await params
    const numericSectionId = Number(sectionId)
    const body = await request.json()
    const modulname = typeof body.modulname === 'string' ? body.modulname.trim() : ''

    if (Number.isNaN(numericSectionId) || !modulname) {
      return NextResponse.json(
        { ok: false, error: 'Ungueltige Moduldaten.' },
        { status: 400 }
      )
    }

    const sections = await addModuleToSection(numericSectionId, modulname)

    return NextResponse.json({
      ok: true,
      sections,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown modules error',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  const unauthorizedResponse = await requireSession()

  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    await dbConnect()

    const { sectionId } = await params
    const numericSectionId = Number(sectionId)
    const body = await request.json()
    const orderedModuleIds = Array.isArray(body.ordered_module_ids)
      ? body.ordered_module_ids.filter((value: unknown): value is string => typeof value === 'string' && value.length > 0)
      : null

    if (Number.isNaN(numericSectionId) || !orderedModuleIds) {
      return NextResponse.json(
        { ok: false, error: 'Ungueltige Modul-Reihenfolge.' },
        { status: 400 }
      )
    }

    const sections = await reorderModulesForSection(numericSectionId, orderedModuleIds)

    return NextResponse.json({
      ok: true,
      sections,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown modules error',
      },
      { status: 500 }
    )
  }
}

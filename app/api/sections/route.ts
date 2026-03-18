import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookieName, verifySessionToken } from '@/lib/auth'
import { dbConnect } from '@/lib/mongodb'
import {
  DEFAULT_PAGE,
  createSection,
  deleteSection,
  ensureDefaultSiteStructure,
  listSectionsForPage,
  reorderSections,
} from '@/lib/site-structure'

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

export async function GET(request: Request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const pageId = Number(searchParams.get('page_id') ?? DEFAULT_PAGE.id)

    if (pageId === DEFAULT_PAGE.id) {
      const { page, sections } = await ensureDefaultSiteStructure()

      return NextResponse.json({
        ok: true,
        page,
        sections,
      })
    }

    const sections = await listSectionsForPage(pageId)

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

export async function POST(request: Request) {
  const unauthorizedResponse = await requireSession()

  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    await dbConnect()

    const body = await request.json()
    const pageId = Number(body.page_id)
    const afterSectionId =
      typeof body.after_section_id === 'number' ? body.after_section_id : null

    if (Number.isNaN(pageId)) {
      return NextResponse.json(
        { ok: false, error: 'page_id ist erforderlich.' },
        { status: 400 }
      )
    }

    const sections = await createSection(pageId, afterSectionId)

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

export async function PATCH(request: Request) {
  const unauthorizedResponse = await requireSession()

  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    await dbConnect()

    const body = await request.json()
    const pageId = Number(body.page_id)
    const orderedSectionIds = Array.isArray(body.ordered_section_ids)
      ? body.ordered_section_ids.map((value: unknown) => Number(value))
      : null

    if (Number.isNaN(pageId) || !orderedSectionIds || orderedSectionIds.some(Number.isNaN)) {
      return NextResponse.json(
        { ok: false, error: 'Ungueltige Section-Reihenfolge.' },
        { status: 400 }
      )
    }

    const sections = await reorderSections(pageId, orderedSectionIds)

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

export async function DELETE(request: Request) {
  const unauthorizedResponse = await requireSession()

  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    await dbConnect()

    const body = await request.json()
    const sectionId = Number(body.id)

    if (Number.isNaN(sectionId)) {
      return NextResponse.json(
        { ok: false, error: 'Section id ist erforderlich.' },
        { status: 400 }
      )
    }

    const sections = await deleteSection(sectionId)

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

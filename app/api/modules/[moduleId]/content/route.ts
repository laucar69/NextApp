import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookieName, verifySessionToken } from '@/lib/auth'
import { dbConnect } from '@/lib/mongodb'
import Module from '@/models/Module'
import {
  getHeadlineModuleContent,
  getTextModuleContent,
  updateHeadlineModuleContent,
  updateTextModuleContent,
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const unauthorizedResponse = await requireSession()

  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    await dbConnect()

    const { moduleId } = await params
    const sectionModule = await Module.findById(moduleId).lean()

    if (!sectionModule) {
      return NextResponse.json(
        { ok: false, error: 'Modul nicht gefunden.' },
        { status: 404 }
      )
    }

    const content =
      sectionModule.modulname === 'headline-module'
        ? await getHeadlineModuleContent(moduleId)
        : sectionModule.modulname === 'text-module'
          ? await getTextModuleContent(moduleId)
          : null

    if (!content) {
      return NextResponse.json(
        { ok: false, error: 'Fuer dieses Modul ist kein Content-Handler vorhanden.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      ok: true,
      content,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown headline module error',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const unauthorizedResponse = await requireSession()

  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    await dbConnect()

    const { moduleId } = await params
    const sectionModule = await Module.findById(moduleId).lean()

    if (!sectionModule) {
      return NextResponse.json(
        { ok: false, error: 'Modul nicht gefunden.' },
        { status: 404 }
      )
    }

    const body = await request.json()
    let content = null

    if (sectionModule.modulname === 'headline-module') {
      const text = typeof body.text === 'string' ? body.text.trim() : ''
      const headlineType = body.headline_type

      if (!text || !['h1', 'h2', 'h3'].includes(headlineType)) {
        return NextResponse.json(
          { ok: false, error: 'Ungueltige Headline-Daten.' },
          { status: 400 }
        )
      }

      content = await updateHeadlineModuleContent(moduleId, {
        text,
        headline_type: headlineType,
      })
    } else if (sectionModule.modulname === 'text-module') {
      const markup = typeof body.markup === 'string' ? body.markup : ''

      content = await updateTextModuleContent(moduleId, {
        markup,
      })
    } else {
      return NextResponse.json(
        { ok: false, error: 'Fuer dieses Modul ist kein Content-Handler vorhanden.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      ok: true,
      content,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown headline module error',
      },
      { status: 500 }
    )
  }
}

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookieName, verifySessionToken } from '@/lib/auth'
import { dbConnect } from '@/lib/mongodb'
import { deleteModule, updateModuleLayout } from '@/lib/site-structure'

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

function isValidWidth(value: unknown): value is 'col-md-12' | 'col-md-8' | 'col-md-6' | 'col-md-4' | 'col-md-3' {
  return ['col-md-12', 'col-md-8', 'col-md-6', 'col-md-4', 'col-md-3'].includes(String(value))
}

function isValidOffset(value: unknown): value is '' | 'offset-md-1' | 'offset-md-2' {
  return ['', 'offset-md-1', 'offset-md-2'].includes(String(value))
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
    const body = await request.json()

    if (!isValidWidth(body.bootstrap_width) || !isValidOffset(body.bootstrap_offset ?? '')) {
      return NextResponse.json(
        { ok: false, error: 'Ungueltige Modul-Konfiguration.' },
        { status: 400 }
      )
    }

    const moduleLayout = await updateModuleLayout(moduleId, {
      bootstrap_width: body.bootstrap_width,
      bootstrap_offset: body.bootstrap_offset ?? '',
    })

    return NextResponse.json({
      ok: true,
      module: moduleLayout,
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

export async function DELETE(
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

    if (!moduleId) {
      return NextResponse.json(
        { ok: false, error: 'Ungueltige Moduldaten.' },
        { status: 400 }
      )
    }

    const sections = await deleteModule(moduleId)

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

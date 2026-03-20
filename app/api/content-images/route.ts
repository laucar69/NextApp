import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookieName, verifySessionToken } from '@/lib/auth'

const CONTENT_IMAGES_ROOT = path.join(process.cwd(), 'public', 'assets', 'content', 'images')
const IMAGE_FILE_PATTERN = /\.(png|jpe?g|gif|webp|svg|avif)$/i

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

function normalizeRelativePath(input: string | null) {
  if (!input) {
    return ''
  }

  const cleaned = input.replace(/^\/+|\/+$/g, '')

  if (!cleaned || cleaned === '.') {
    return ''
  }

  const normalized = path.posix.normalize(cleaned)

  if (normalized.startsWith('..')) {
    throw new Error('Ungueltiger Ordnerpfad.')
  }

  return normalized
}

function toPublicAssetPath(relativePath: string) {
  const normalized = relativePath.split(path.sep).join('/')
  return `/assets/content/images/${normalized}`
}

export async function GET(request: Request) {
  const unauthorizedResponse = await requireSession()

  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    const url = new URL(request.url)
    const relativePath = normalizeRelativePath(url.searchParams.get('path'))
    const absolutePath = path.join(CONTENT_IMAGES_ROOT, relativePath)
    const resolvedPath = path.resolve(absolutePath)

    if (!resolvedPath.startsWith(path.resolve(CONTENT_IMAGES_ROOT))) {
      return NextResponse.json(
        { ok: false, error: 'Ungueltiger Ordnerpfad.' },
        { status: 400 }
      )
    }

    const entries = await readdir(resolvedPath, { withFileTypes: true })
    const folders = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({
        name: entry.name,
        path: relativePath ? `${relativePath}/${entry.name}` : entry.name,
        type: 'folder' as const,
      }))
      .sort((left, right) => left.name.localeCompare(right.name, 'de'))
    const images = entries
      .filter((entry) => entry.isFile() && IMAGE_FILE_PATTERN.test(entry.name))
      .map((entry) => {
        const entryPath = relativePath ? `${relativePath}/${entry.name}` : entry.name

        return {
          name: entry.name,
          path: entryPath,
          src: toPublicAssetPath(entryPath),
          type: 'image' as const,
        }
      })
      .sort((left, right) => left.name.localeCompare(right.name, 'de'))

    return NextResponse.json({
      ok: true,
      currentPath: relativePath,
      parentPath: relativePath ? path.posix.dirname(relativePath) === '.' ? '' : path.posix.dirname(relativePath) : null,
      entries: [...folders, ...images],
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Dateien konnten nicht geladen werden.',
      },
      { status: 500 }
    )
  }
}

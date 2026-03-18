import { createHmac, timingSafeEqual } from 'node:crypto'

const AUTH_COOKIE_NAME = 'roadhouse_session'
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET

  if (!secret) {
    throw new Error('Please define the AUTH_SECRET environment variable.')
  }

  return secret
}

function sign(value: string) {
  return createHmac('sha256', getAuthSecret()).update(value).digest('base64url')
}

export function createSessionToken(uid: string) {
  const expiresAt = Date.now() + SESSION_DURATION_MS
  const payload = `${uid}.${expiresAt}`
  const signature = sign(payload)

  return `${payload}.${signature}`
}

export function verifySessionToken(token?: string | null) {
  if (!token) {
    return null
  }

  const parts = token.split('.')

  if (parts.length < 3) {
    return null
  }

  const signature = parts.pop()
  const expiresAt = parts.pop()
  const uid = parts.join('.')

  if (!signature || !expiresAt || !uid) {
    return null
  }

  const payload = `${uid}.${expiresAt}`
  const expectedSignature = sign(payload)
  const signaturesMatch = timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )

  if (!signaturesMatch) {
    return null
  }

  if (Number.isNaN(Number(expiresAt)) || Number(expiresAt) < Date.now()) {
    return null
  }

  return {
    uid,
    expiresAt: Number(expiresAt),
  }
}

export function getAuthCookieName() {
  return AUTH_COOKIE_NAME
}

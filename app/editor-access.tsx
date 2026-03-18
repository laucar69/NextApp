'use client'

import type { FormEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'

type SessionState = {
  authenticated: boolean
  uid: string | null
}

type EditorAccessProps = {
  onAddSection?: () => void
  onSessionChange?: (authenticated: boolean) => void
}

function hasEditHash() {
  return window.location.hash === '#edit'
}

export function EditorAccess({ onAddSection, onSessionChange }: EditorAccessProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [session, setSession] = useState<SessionState>({
    authenticated: false,
    uid: null,
  })
  const [uid, setUid] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const loadSession = useCallback(async () => {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      cache: 'no-store',
    })
    const result = await response.json()
    const authenticated = Boolean(result.authenticated)

    setSession({
      authenticated,
      uid: result.user?.uid ?? null,
    })
    onSessionChange?.(authenticated)
  }, [onSessionChange])

  useEffect(() => {
    function syncEditMode() {
      setIsEditMode(hasEditHash())
    }

    syncEditMode()
    window.addEventListener('hashchange', syncEditMode)
    void loadSession()

    return () => {
      window.removeEventListener('hashchange', syncEditMode)
    }
  }, [loadSession])

  function exitEditMode() {
    window.location.hash = ''
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid,
          password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setErrorMessage(result.error || 'Login fehlgeschlagen.')
        return
      }

      setPassword('')
      await loadSession()
    } catch {
      setErrorMessage('Login fehlgeschlagen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
    })

    setSession({
      authenticated: false,
      uid: null,
    })
    setUid('')
    setPassword('')
    setErrorMessage('')
    onSessionChange?.(false)
    exitEditMode()
  }

  const shouldShowLogin = isEditMode && !session.authenticated
  const shouldShowPanel = session.authenticated

  return (
    <>
      {shouldShowPanel ? (
        <div className="editor-panel">
          <div className="editor-panel__inner admin-surface">
            <p className="editor-panel__title">Admin Panel</p>
            <p className="editor-panel__status">
              Eingeloggt als <strong>{session.uid}</strong>
            </p>
            <div className="editor-panel__actions">
              {onAddSection ? (
                <button type="button" className="editor-panel__link admin-link-button" onClick={onAddSection}>
                  Add Section
                </button>
              ) : null}
              <button type="button" className="editor-panel__link admin-link-button" onClick={handleLogout}>
                Abmelden
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {shouldShowLogin ? (
        <div className="edit-login-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-login-title">
          <div className="edit-login-backdrop" onClick={exitEditMode} />
          <div className="edit-login-panel">
            <p className="edit-login-kicker">Redaktionszugang</p>
            <h2 id="edit-login-title">Login</h2>
            <p className="edit-login-copy">
              Bitte melde dich an, um den Bearbeitungsmodus zu starten.
            </p>

            <form className="edit-login-form" onSubmit={handleSubmit}>
              <label className="edit-login-field">
                <span>User ID</span>
                <input
                  type="text"
                  name="uid"
                  autoComplete="username"
                  value={uid}
                  onChange={(event) => setUid(event.target.value)}
                />
              </label>

              <label className="edit-login-field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>

              {errorMessage ? <p className="edit-login-error">{errorMessage}</p> : null}

              <div className="edit-login-actions">
                <button
                  type="button"
                  className="edit-login-button edit-login-button--ghost"
                  onClick={exitEditMode}
                >
                  Abbrechen
                </button>
                <button type="submit" className="edit-login-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Anmeldung...' : 'Anmelden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}

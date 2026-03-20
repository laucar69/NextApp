'use client'

import type { FormEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'

export type SessionState = {
  authenticated: boolean
  uid: string | null
}

type UseEditorAccessControllerArgs = {
  onSessionChange?: (authenticated: boolean) => void
}

function hasEditHash() {
  return window.location.hash === '#edit'
}

export function useEditorAccessController({
  onSessionChange,
}: UseEditorAccessControllerArgs) {
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

  const exitEditMode = useCallback(() => {
    window.location.hash = ''
  }, [])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
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
    },
    [loadSession, password, uid]
  )

  const handleLogout = useCallback(async () => {
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
  }, [exitEditMode, onSessionChange])

  return {
    errorMessage,
    exitEditMode,
    handleLogout,
    handleSubmit,
    isEditMode,
    isSubmitting,
    password,
    session,
    setPassword,
    setUid,
    shouldShowLogin: isEditMode && !session.authenticated,
    shouldShowPanel: session.authenticated,
    uid,
  }
}

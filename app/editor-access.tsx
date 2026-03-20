'use client'

import type { PointerEvent as ReactPointerEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useEditorAccessController } from './auth'
import type { AvailableModuleItem } from './modules'

type EditorAccessProps = {
  availableModules?: AvailableModuleItem[]
  onAddSection?: () => void
  onModuleDragStart?: (module: AvailableModuleItem, event: ReactPointerEvent<HTMLButtonElement>) => void
  onSessionChange?: (authenticated: boolean) => void
}

export function EditorAccess({
  availableModules = [],
  onAddSection,
  onModuleDragStart,
  onSessionChange,
}: EditorAccessProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const [panelPosition, setPanelPosition] = useState<{ left: number; top: number } | null>(null)
  const [isDraggingPanel, setIsDraggingPanel] = useState(false)
  const {
    errorMessage,
    exitEditMode,
    handleLogout,
    handleSubmit,
    isSubmitting,
    password,
    session,
    setPassword,
    setUid,
    shouldShowLogin,
    shouldShowPanel,
    uid,
  } = useEditorAccessController({
    onSessionChange,
  })

  useEffect(() => {
    if (!isDraggingPanel) {
      return
    }

    function handlePointerMove(event: PointerEvent) {
      const panel = panelRef.current

      if (!panel) {
        return
      }

      const maxLeft = Math.max(8, window.innerWidth - panel.offsetWidth - 8)
      const maxTop = Math.max(8, window.innerHeight - panel.offsetHeight - 8)
      const left = Math.min(Math.max(8, event.clientX - dragOffsetRef.current.x), maxLeft)
      const top = Math.min(Math.max(8, event.clientY - dragOffsetRef.current.y), maxTop)

      setPanelPosition({ left, top })
    }

    function stopDragging() {
      setIsDraggingPanel(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)
    window.addEventListener('pointercancel', stopDragging)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopDragging)
      window.removeEventListener('pointercancel', stopDragging)
    }
  }, [isDraggingPanel])

  function handlePanelDragStart(event: ReactPointerEvent<HTMLDivElement>) {
    const panel = panelRef.current

    if (!panel) {
      return
    }

    const rect = panel.getBoundingClientRect()

    dragOffsetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }

    setPanelPosition({
      left: rect.left,
      top: rect.top,
    })
    setIsDraggingPanel(true)
  }

  return (
    <>
      {shouldShowPanel ? (
        <div
          ref={panelRef}
          className={`editor-panel${isDraggingPanel ? ' editor-panel--dragging' : ''}`}
          style={panelPosition ? { left: panelPosition.left, top: panelPosition.top, right: 'auto' } : undefined}
        >
          <div className="editor-panel__inner admin-surface d-grid gap-2">
            <div
              className="editor-panel__drag-handle"
              onPointerDown={handlePanelDragStart}
              role="presentation"
            >
              <svg className="editor-panel__drag-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm9-11a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
              </svg>
              <p className="editor-panel__title mb-0">Admin Panel</p>
            </div>
            <p className="editor-panel__status mb-0">
              Eingeloggt als <strong>{session.uid}</strong>
            </p>
            <div className="editor-panel__actions list-unstyled mb-0">
              {onAddSection ? (
                <button type="button" className="editor-panel__link admin-link-button" onClick={onAddSection}>
                  <svg className="editor-panel__link-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 5a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H6a1 1 0 1 1 0-2h5V6a1 1 0 0 1 1-1Z" />
                  </svg>
                  Add Section
                </button>
              ) : null}
              {availableModules.length > 0 ? (
                <div className="editor-panel__modules">
                  <p className="editor-panel__modules-title mb-0">Module</p>
                  <div className="editor-panel__modules-list" role="list" aria-label="Verfuegbare Module">
                    {availableModules.map((module) => (
                      <button
                        key={module.key}
                        type="button"
                        className="editor-panel__module-item"
                        onPointerDown={(event) => onModuleDragStart?.(module, event)}
                      >
                        <svg className="editor-panel__module-drag-icon" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M9 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm9-11a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                        </svg>
                        {module.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <hr className="editor-panel__divider" />
              <button type="button" className="editor-panel__link admin-link-button" onClick={handleLogout}>
                <svg className="editor-panel__link-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M10 4a1 1 0 0 1 0 2H7v12h3a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h4Zm5.293 4.293a1 1 0 0 1 1.414 0l3.999 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414-1.414L17.586 13H10a1 1 0 1 1 0-2h7.586l-2.293-2.293a1 1 0 0 1 0-1.414Z" />
                </svg>
                Abmelden
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {shouldShowLogin ? (
        <div className="edit-login-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-login-title">
          <div className="edit-login-backdrop" onClick={exitEditMode} />
          <div className="edit-login-panel container">
            <div className="row g-0">
              <div className="col-12">
                <p className="edit-login-kicker mb-2">Redaktionszugang</p>
                <h2 id="edit-login-title" className="mb-2">Login</h2>
                <p className="edit-login-copy">
                  Bitte melde dich an, um den Bearbeitungsmodus zu starten.
                </p>

                <form className="edit-login-form" onSubmit={handleSubmit}>
                  <label className="edit-login-field">
                    <span>User ID</span>
                    <input
                      className="form-control"
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
                      className="form-control"
                      type="password"
                      name="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </label>

                  {errorMessage ? <p className="edit-login-error mb-0">{errorMessage}</p> : null}

                  <div className="edit-login-actions d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="edit-login-button edit-login-button--ghost btn"
                      onClick={exitEditMode}
                    >
                      Abbrechen
                    </button>
                    <button type="submit" className="edit-login-button btn" disabled={isSubmitting}>
                      {isSubmitting ? 'Anmeldung...' : 'Anmelden'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

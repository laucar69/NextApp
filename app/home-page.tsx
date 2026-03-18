'use client'

import type { PointerEvent as ReactPointerEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { EditorAccess } from './editor-access'
import { InitModule } from './modules/init-module'
import { TestModule } from './modules/test-module'

type SectionItem = {
  id: number
  page_id: number
  position: number
  name: string
}

const DEFAULT_PAGE_ID = 0

export function HomePage() {
  const [sections, setSections] = useState<SectionItem[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [draggedSectionId, setDraggedSectionId] = useState<number | null>(null)
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null)
  const [sectionPendingDelete, setSectionPendingDelete] = useState<number | null>(null)
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null)
  const [sectionNameDrafts, setSectionNameDrafts] = useState<Record<number, string>>({})
  const [dragPreviewPosition, setDragPreviewPosition] = useState<{
    x: number
    y: number
    width: number
  } | null>(null)
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const autoScrollFrameRef = useRef<number | null>(null)
  const autoScrollSpeedRef = useRef(0)
  const pointerPositionRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    void loadSections()

    return () => {
      if (autoScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(autoScrollFrameRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const nextDrafts: Record<number, string> = {}

    for (const section of sections) {
      nextDrafts[section.id] = section.name
    }

    setSectionNameDrafts(nextDrafts)
  }, [sections])

  useEffect(() => {
    if (draggedSectionId === null) {
      return
    }

    function handlePointerMove(event: PointerEvent) {
      pointerPositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      }

      updateDragPreviewPosition(event.clientX, event.clientY)
      maybeAutoScroll(event.clientY)
      updateDropIndicatorFromPointer(event.clientY)
    }

    function handlePointerUp() {
      if (dropIndicatorIndex !== null) {
        handleDrop(dropIndicatorIndex)
        return
      }

      handleDragEnd()
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [draggedSectionId, dropIndicatorIndex, sections])

  async function loadSections() {
    try {
      const response = await fetch(`/api/sections?page_id=${DEFAULT_PAGE_ID}`, {
        method: 'GET',
        cache: 'no-store',
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Sections konnten nicht geladen werden.')
      }

      setSections(result.sections ?? [])
    } catch (error) {
      console.error(error)
    }
  }

  function getDraggedSectionIndex(currentSections: SectionItem[]) {
    if (draggedSectionId === null) {
      return -1
    }

    return currentSections.findIndex((section) => section.id === draggedSectionId)
  }

  function isValidDropIndex(targetIndex: number, currentSections: SectionItem[]) {
    const draggedIndex = getDraggedSectionIndex(currentSections)

    if (draggedIndex === -1) {
      return true
    }

    return targetIndex !== draggedIndex && targetIndex !== draggedIndex + 1
  }

  function getNormalizedDropIndex(targetIndex: number, currentSections: SectionItem[]) {
    const draggedIndex = getDraggedSectionIndex(currentSections)

    if (draggedIndex === -1) {
      return targetIndex
    }

    if (targetIndex === draggedIndex) {
      return Math.max(0, draggedIndex - 1)
    }

    if (targetIndex === draggedIndex + 1) {
      return Math.min(currentSections.length, draggedIndex + 2)
    }

    return targetIndex
  }

  function handleAddSection() {
    void createSectionRequest(null)
  }

  function handleInsertSectionAfter(sectionId: number) {
    void createSectionRequest(sectionId)
  }

  async function handleConfirmRemoveSection() {
    if (sectionPendingDelete === null) {
      return
    }

    setSectionPendingDelete(null)
    await removeSectionRequest(sectionPendingDelete)
  }

  async function createSectionRequest(afterSectionId?: number | null) {
    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_id: DEFAULT_PAGE_ID,
          after_section_id: afterSectionId,
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Section konnte nicht erstellt werden.')
      }

      setSections(result.sections ?? [])
    } catch (error) {
      console.error(error)
    }
  }

  async function removeSectionRequest(sectionId: number) {
    try {
      const response = await fetch('/api/sections', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: sectionId,
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Section konnte nicht geloescht werden.')
      }

      setSections(result.sections ?? [])
    } catch (error) {
      console.error(error)
    }
  }

  async function reorderSectionsRequest(orderedSectionIds: number[]) {
    try {
      const response = await fetch('/api/sections', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_id: DEFAULT_PAGE_ID,
          ordered_section_ids: orderedSectionIds,
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Section-Reihenfolge konnte nicht gespeichert werden.')
      }

      setSections(result.sections ?? [])
    } catch (error) {
      console.error(error)
      await loadSections()
    }
  }

  async function updateSectionNameRequest(sectionId: number) {
    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sectionNameDrafts[sectionId] ?? '',
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Section-Name konnte nicht gespeichert werden.')
      }

      setSections(result.sections ?? [])
      setEditingSectionId(null)
    } catch (error) {
      console.error(error)
      await loadSections()
      setEditingSectionId(null)
    }
  }

  function handlePointerDragStart(
    sectionId: number,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    const sectionIndex = sections.findIndex((section) => section.id === sectionId)
    const sectionElement = event.currentTarget.closest('.section__group') as HTMLDivElement | null

    if (!sectionElement) {
      return
    }

    event.preventDefault()
    pointerPositionRef.current = {
      x: event.clientX,
      y: event.clientY,
    }
    setDraggedSectionId(sectionId)
    setDropIndicatorIndex(sectionIndex === -1 ? 0 : sectionIndex)
    setDragPreviewPosition({
      x: event.clientX - 20,
      y: event.clientY - 18,
      width: sectionElement.offsetWidth,
    })
  }

  function handleDragEnd() {
    setDraggedSectionId(null)
    setDropIndicatorIndex(null)
    setDragPreviewPosition(null)
    stopAutoScroll()
  }

  function runAutoScroll() {
    if (autoScrollSpeedRef.current === 0) {
      autoScrollFrameRef.current = null
      return
    }

    window.scrollBy({
      top: autoScrollSpeedRef.current,
      behavior: 'auto',
    })

    if (pointerPositionRef.current) {
      updateDropIndicatorFromPointer(pointerPositionRef.current.y)
      updateDragPreviewPosition(pointerPositionRef.current.x, pointerPositionRef.current.y)
    }

    autoScrollFrameRef.current = window.requestAnimationFrame(runAutoScroll)
  }

  function stopAutoScroll() {
    autoScrollSpeedRef.current = 0

    if (autoScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(autoScrollFrameRef.current)
      autoScrollFrameRef.current = null
    }
  }

  function maybeAutoScroll(pointerClientY: number) {
    const edgeThreshold = 96
    const maxSpeed = 18
    let nextSpeed = 0

    if (pointerClientY < edgeThreshold) {
      const intensity = (edgeThreshold - pointerClientY) / edgeThreshold
      nextSpeed = -Math.max(6, Math.round(maxSpeed * intensity))
    } else if (window.innerHeight - pointerClientY < edgeThreshold) {
      const intensity = (edgeThreshold - (window.innerHeight - pointerClientY)) / edgeThreshold
      nextSpeed = Math.max(6, Math.round(maxSpeed * intensity))
    }

    if (nextSpeed === 0) {
      stopAutoScroll()
      return
    }

    autoScrollSpeedRef.current = nextSpeed

    if (autoScrollFrameRef.current === null) {
      autoScrollFrameRef.current = window.requestAnimationFrame(runAutoScroll)
    }
  }

  function handleDrop(targetIndex: number) {
    if (draggedSectionId === null) {
      return
    }

    const normalizedTargetIndex = getNormalizedDropIndex(targetIndex, sections)

    const fromIndex = sections.findIndex((section) => section.id === draggedSectionId)

    if (fromIndex === -1) {
      handleDragEnd()
      return
    }

    const nextSections = [...sections]
    const [draggedSection] = nextSections.splice(fromIndex, 1)
    const insertIndex =
      fromIndex < normalizedTargetIndex ? normalizedTargetIndex - 1 : normalizedTargetIndex

    nextSections.splice(insertIndex, 0, draggedSection)
    setSections(
      nextSections.map((section, index) => ({
        ...section,
        position: index + 1,
      }))
    )

    handleDragEnd()
    void reorderSectionsRequest(nextSections.map((section) => section.id))
  }

  function updateDragPreviewPosition(clientX: number, clientY: number) {
    setDragPreviewPosition((currentPosition) => {
      if (!currentPosition) {
        return currentPosition
      }

      return {
        ...currentPosition,
        x: clientX - 20,
        y: clientY - 18,
      }
    })
  }

  function updateDropIndicatorFromPointer(pointerClientY: number) {
    let rawDropIndex = sections.length

    for (let index = 0; index < sections.length; index += 1) {
      const section = sections[index]
      const sectionElement = sectionRefs.current[section.id]

      if (!sectionElement) {
        continue
      }

      const bounds = sectionElement.getBoundingClientRect()
      const sectionMidpoint = bounds.top + bounds.height / 2

      if (pointerClientY < sectionMidpoint) {
        rawDropIndex = index
        break
      }
    }

    const nextDropIndex = getNormalizedDropIndex(rawDropIndex, sections)

    if (isValidDropIndex(nextDropIndex, sections)) {
      setDropIndicatorIndex(nextDropIndex)
    }
  }

  function renderSectionModule(section: SectionItem) {
    return section.id === 1 ? <InitModule /> : <TestModule number={section.id} />
  }

  return (
    <>
      <div className="page-shell">
        <header className="page-header">
          <h3>header</h3>
        </header>
        <main className="hero">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`section__group${draggedSectionId === section.id ? ' section__group--dragging' : ''}`}
              ref={(element) => {
                sectionRefs.current[section.id] = element
              }}
            >
              {draggedSectionId !== null && isValidDropIndex(index, sections) ? (
                <div
                  className={`section__drop-zone${dropIndicatorIndex === index ? ' section__drop-zone--active' : ''}`}
                />
              ) : null}
              <section id={`section-${section.id}`} className="section">
                <div className="section__card">
                  {isAuthenticated ? (
                    <div className="section__toolbar section__toolbar--top admin-surface">
                      <div className="section__toolbar-main">
                        <button
                          type="button"
                          className="section__icon-button section__icon-button--move admin-icon-button"
                          aria-label={`Section ${section.id} verschieben`}
                          onPointerDown={(event) => handlePointerDragStart(section.id, event)}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 2l2.8 2.8-1.8 1.8H11V4.6L9.2 6.4 7.4 4.6 12 2zm0 20l-4.6-4.6 1.8-1.8L11 17.4v-2.8h2v2.8l1.8-1.8 1.8 1.8L12 22zM2 12l4.6-4.6 1.8 1.8L6.6 11H9v2H6.6l1.8 1.8-1.8 1.8L2 12zm20 0l-4.6 4.6-1.8-1.8 1.8-1.8H15v-2h2.4l-1.8-1.8 1.8-1.8L22 12z" />
                          </svg>
                        </button>
                        {editingSectionId === section.id ? (
                          <input
                            className="section__name-input admin-text-input"
                            type="text"
                            value={sectionNameDrafts[section.id] ?? ''}
                            autoFocus
                            onChange={(event) =>
                              setSectionNameDrafts((currentDrafts) => ({
                                ...currentDrafts,
                                [section.id]: event.target.value,
                              }))
                            }
                            onBlur={() => {
                              setSectionNameDrafts((currentDrafts) => ({
                                ...currentDrafts,
                                [section.id]: section.name,
                              }))
                              setEditingSectionId(null)
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault()
                                void updateSectionNameRequest(section.id)
                              }

                              if (event.key === 'Escape') {
                                setSectionNameDrafts((currentDrafts) => ({
                                  ...currentDrafts,
                                  [section.id]: section.name,
                                }))
                                setEditingSectionId(null)
                              }
                            }}
                          />
                        ) : (
                          <button
                            type="button"
                            className="section__name-button"
                            onClick={() => setEditingSectionId(section.id)}
                          >
                            <span className="section__name-label">
                              {section.name.trim() || 'Section'}
                            </span>
                            <svg
                              className="section__name-edit-icon"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path d="M15.2 5.2l3.6 3.6-9.9 9.9-4.3.7.7-4.3 9.9-9.9zm1.4-1.4l1.6-1.6c.6-.6 1.6-.6 2.2 0l1.6 1.6c.6.6.6 1.6 0 2.2L22.4 7.6l-5.8-5.8z" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="section__toolbar-actions">
                        <button
                          type="button"
                          className="section__icon-button admin-icon-button"
                          aria-label={`Section ${section.id} hinzufuegen`}
                          onClick={() => handleInsertSectionAfter(section.id)}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="section__icon-button admin-icon-button"
                          aria-label={`Section ${section.id} entfernen`}
                          onClick={() => setSectionPendingDelete(section.id)}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4 6.4 5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {renderSectionModule(section)}
                </div>
              </section>
            </div>
          ))}
          {draggedSectionId !== null && isValidDropIndex(sections.length, sections) ? (
            <div className={`section__drop-zone${dropIndicatorIndex === sections.length ? ' section__drop-zone--active' : ''}`} />
          ) : null}
        </main>
        <footer className="page-footer">
          <b>footer</b>
        </footer>
      </div>
      <EditorAccess onAddSection={handleAddSection} onSessionChange={setIsAuthenticated} />
      {draggedSectionId !== null && dragPreviewPosition ? (
        <div
          className="section__floating-preview"
          style={{
            width: dragPreviewPosition.width,
            transform: `translate(${dragPreviewPosition.x}px, ${dragPreviewPosition.y}px)`,
          }}
        >
          <div className="section__card">
            {renderSectionModule(
              sections.find((section) => section.id === draggedSectionId) ?? sections[0]
            )}
          </div>
        </div>
      ) : null}
      {sectionPendingDelete !== null ? (
        <div className="confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-delete-title">
          <div className="confirm-backdrop" onClick={() => setSectionPendingDelete(null)} />
          <div className="confirm-panel">
            <h2 id="confirm-delete-title">Section loeschen?</h2>
            <p className="confirm-copy">Moechtest du diese Section wirklich loeschen?</p>
            <div className="confirm-actions">
              <button
                type="button"
                className="confirm-button confirm-button--ghost"
                onClick={() => setSectionPendingDelete(null)}
              >
                Nein
              </button>
              <button type="button" className="confirm-button" onClick={handleConfirmRemoveSection}>
                Ja
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

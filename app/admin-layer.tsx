'use client'

import { Fragment } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { AdminController } from './admin'
import { EditorAccess } from './editor-access'
import { AVAILABLE_MODULES, renderSectionModule } from './modules'

type AdminLayerProps = {
  isAuthenticated: boolean
  onSessionChange: Dispatch<SetStateAction<boolean>>
  admin: AdminController
}

export function AdminLayer({ isAuthenticated, onSessionChange, admin }: AdminLayerProps) {
  const {
    dragPreviewPosition,
    draggedAvailableModule,
    draggedSectionModuleId,
    draggedSectionModuleSectionId,
    draggedSectionId,
    handleAddSection,
    handleConfirmRemoveSection,
    handleModulePointerDragStart,
    sectionPendingDelete,
    sections,
    setSectionPendingDelete,
  } = admin

  const draggedSection = sections.find((section) => section.id === draggedSectionId) ?? sections[0] ?? null
  const draggedSectionModuleSection =
    sections.find((section) => section.id === draggedSectionModuleSectionId) ?? null
  const draggedSectionModule =
    draggedSectionModuleSection?.modules.find((module) => module._id === draggedSectionModuleId) ?? null

  return (
    <>
      <EditorAccess
        availableModules={AVAILABLE_MODULES}
        onAddSection={handleAddSection}
        onModuleDragStart={handleModulePointerDragStart}
        onSessionChange={onSessionChange}
      />
      {draggedSectionId !== null && dragPreviewPosition && draggedSection ? (
        <div
          className="section__floating-preview"
          style={{
            width: dragPreviewPosition.width,
            transform: `translate(${dragPreviewPosition.x}px, ${dragPreviewPosition.y}px)`,
          }}
        >
          <section className={`container section${isAuthenticated ? ' section--admin' : ''}`}>
            <div className="row content">
              {draggedSection.modules.map((module) => (
                <Fragment key={module._id}>{renderSectionModule(draggedSection, module)}</Fragment>
              ))}
              {isAuthenticated ? <div className="col-12 module__drop-zone" aria-hidden="true" /> : null}
            </div>
          </section>
        </div>
      ) : null}
      {draggedAvailableModule && dragPreviewPosition ? (
        <div
          className="module__floating-preview"
          style={{
            width: dragPreviewPosition.width,
            transform: `translate(${dragPreviewPosition.x}px, ${dragPreviewPosition.y}px)`,
          }}
        >
          <div className="module__drag-preview">{draggedAvailableModule.name}</div>
        </div>
      ) : null}
      {draggedSectionModuleSection && draggedSectionModule && dragPreviewPosition ? (
        <div
          className="module__floating-preview"
          style={{
            width: dragPreviewPosition.width,
            transform: `translate(${dragPreviewPosition.x}px, ${dragPreviewPosition.y}px)`,
          }}
        >
          {renderSectionModule(draggedSectionModuleSection, draggedSectionModule)}
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

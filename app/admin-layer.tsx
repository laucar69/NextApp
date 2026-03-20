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
    editingImageModuleId,
    handleAddSection,
    handleCancelEditingImageModule,
    handleConfirmRemoveSection,
    handleOpenImageBrowserFolder,
    handleModulePointerDragStart,
    handleSaveImageModule,
    handleSelectImageModuleDraft,
    imageBrowserEntries,
    imageBrowserParentPath,
    imageBrowserPath,
    imageModuleDraft,
    isLoadingImageBrowser,
    sectionPendingDelete,
    sections,
    setSectionPendingDelete,
  } = admin

  const draggedSection = sections.find((section) => section.id === draggedSectionId) ?? sections[0] ?? null
  const draggedSectionModuleSection =
    sections.find((section) => section.id === draggedSectionModuleSectionId) ?? null
  const draggedSectionModule =
    draggedSectionModuleSection?.modules.find((module) => module._id === draggedSectionModuleId) ?? null
  const editingImageModule = sections
    .flatMap((section) => section.modules)
    .find((module) => module._id === editingImageModuleId && module.modulname === 'image-module')
  const currentImageSrc =
    editingImageModule?.content && 'src' in editingImageModule.content
      ? editingImageModule.content.src
      : '/assets/admin/noimg.jpg'
  const currentImageAlt =
    editingImageModule?.content && 'alt' in editingImageModule.content
      ? editingImageModule.content.alt
      : 'Kein Bild ausgewaehlt'

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
      {editingImageModule ? (
        <div className="image-module-overlay" role="dialog" aria-modal="true" aria-labelledby="image-module-title">
          <div className="image-module-overlay__backdrop" onClick={handleCancelEditingImageModule} />
          <div className="image-module-overlay__panel admin-surface">
            <div className="image-module-overlay__columns">
              <div className="image-module-overlay__sidebar">
                <div className="image-module-overlay__sidebar-header">
                  <h2 id="image-module-title" className="image-module-overlay__title">
                    Image Selection
                  </h2>
                  <p className="image-module-overlay__path mb-0">
                    /assets/content/images{imageBrowserPath ? `/${imageBrowserPath}` : ''}
                  </p>
                </div>
                <div className="image-module-overlay__browser">
                  {imageBrowserParentPath !== null ? (
                    <button
                      type="button"
                      className="image-browser-entry image-browser-entry--folder"
                      onClick={() => handleOpenImageBrowserFolder(imageBrowserParentPath)}
                    >
                      <span className="image-browser-entry__folder-icon" aria-hidden="true">
                        ..
                      </span>
                      <span className="image-browser-entry__label">Eine Ebene nach oben</span>
                    </button>
                  ) : null}
                  {imageBrowserEntries.map((entry) =>
                    entry.type === 'folder' ? (
                      <button
                        key={entry.path}
                        type="button"
                        className="image-browser-entry image-browser-entry--folder"
                        onClick={() => handleOpenImageBrowserFolder(entry.path)}
                      >
                        <span className="image-browser-entry__folder-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H10l2 2h7.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-11z" />
                          </svg>
                        </span>
                        <span className="image-browser-entry__label">{entry.name}</span>
                      </button>
                    ) : (
                      <button
                        key={entry.path}
                        type="button"
                        className={`image-browser-entry image-browser-entry--image${
                          imageModuleDraft === entry.src ? ' image-browser-entry--selected' : ''
                        }`}
                        onClick={() => handleSelectImageModuleDraft(entry.src ?? '')}
                      >
                        <img src={entry.src} alt={entry.name} className="image-browser-entry__thumb" />
                        <span className="image-browser-entry__label">{entry.name}</span>
                      </button>
                    )
                  )}
                  {!isLoadingImageBrowser && imageBrowserEntries.length === 0 ? (
                    <p className="image-module-overlay__empty mb-0">Keine Ordner oder Bilder gefunden.</p>
                  ) : null}
                  {isLoadingImageBrowser ? (
                    <p className="image-module-overlay__empty mb-0">Bilder werden geladen...</p>
                  ) : null}
                </div>
              </div>
              <div className="image-module-overlay__preview">
                <p className="image-module-overlay__preview-label mb-2">Preview</p>
                <div className="image-module-overlay__preview-frame">
                  <img src={imageModuleDraft || currentImageSrc} alt={currentImageAlt} />
                </div>
              </div>
            </div>
            <div className="module__rte-actions">
              <button
                type="button"
                className="module__edit-action module__edit-action--confirm"
                aria-label="Bild speichern"
                title="Bild speichern"
                onClick={() => handleSaveImageModule(editingImageModule._id)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9.2 16.6 4.6 12l1.4-1.4 3.2 3.2 8.8-8.8 1.4 1.4-10.2 10.2z" />
                </svg>
              </button>
              <button
                type="button"
                className="module__edit-action"
                aria-label="Bildauswahl schliessen"
                title="Bildauswahl schliessen"
                onClick={handleCancelEditingImageModule}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4 6.4 5z" />
                </svg>
              </button>
            </div>
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

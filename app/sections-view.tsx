'use client'

import { cloneElement, Fragment, isValidElement } from 'react'
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import type { AdminController } from './admin'
import type { SectionItem } from './global'
import { renderSectionModule } from './modules'

type SectionsViewProps = {
  isAuthenticated: boolean
  admin: AdminController
}

type SectionGroupProps = {
  index: number
  isAuthenticated: boolean
  section: SectionItem
  admin: AdminController
}

function enhanceModuleCard(
  content: ReturnType<typeof renderSectionModule>,
  sectionId: number,
  module: SectionItem['modules'][number],
  isDragging: boolean,
  onMove: (sectionId: number, module: SectionItem['modules'][number], event: ReactPointerEvent<HTMLButtonElement>) => void,
  onEdit: (module: SectionItem['modules'][number]) => void,
  configuringModuleId: string | null,
  moduleWidthDraft: 'col-md-12' | 'col-md-8' | 'col-md-6' | 'col-md-4' | 'col-md-3',
  moduleOffsetDraft: '' | 'offset-md-1' | 'offset-md-2',
  onOpenConfig: (module: SectionItem['modules'][number]) => void,
  onCloseConfig: () => void,
  onWidthDraftChange: (value: 'col-md-12' | 'col-md-8' | 'col-md-6' | 'col-md-4' | 'col-md-3') => void,
  onOffsetDraftChange: (value: '' | 'offset-md-1' | 'offset-md-2') => void,
  onSaveConfig: (moduleId: string) => void,
  editingHeadlineModuleId: string | null,
  headlineModuleTypeDraft: 'h1' | 'h2' | 'h3',
  headlineModuleDraft: string,
  onHeadlineDraftChange: (value: string) => void,
  onHeadlineDraftCancel: () => void,
  onHeadlineDraftHeadlineTypeChange: (value: 'h1' | 'h2' | 'h3') => void,
  onHeadlineDraftSave: (moduleId: string) => void,
  editingImageModuleId: string | null,
  editingTextModuleId: string | null,
  textModuleDraft: string,
  onTextDraftChange: (value: string) => void,
  onTextDraftCancel: () => void,
  onTextDraftSave: (moduleId: string) => void,
  moduleId: string,
  onDelete: (moduleId: string) => void
) {
  if (!isValidElement(content)) {
    return content
  }

  const existingChildren = content.props.children
  const existingClassName =
    typeof content.props.className === 'string' ? content.props.className : ''
  const isEditing =
    (module.modulname === 'headline-module' && editingHeadlineModuleId === module._id) ||
    (module.modulname === 'image-module' && editingImageModuleId === module._id) ||
    (module.modulname === 'text-module' && editingTextModuleId === module._id)
  const isConfiguring = configuringModuleId === module._id
  const nextClassName = `${existingClassName} module__card--interactive${
    isDragging ? ' module__card--dragging' : ''
  }${isEditing ? ' module__card--editing' : ''}`.trim()
  const moduleEditingProps =
    module.modulname === 'headline-module'
      ? {
          draftHeadlineType: headlineModuleTypeDraft,
          draftText: headlineModuleDraft,
          isEditing: editingHeadlineModuleId === module._id,
          onDraftCancel: onHeadlineDraftCancel,
          onDraftHeadlineTypeChange: onHeadlineDraftHeadlineTypeChange,
          onDraftChange: onHeadlineDraftChange,
          onSaveDraft: () => onHeadlineDraftSave(module._id),
        }
      : module.modulname === 'text-module'
        ? {
            draftMarkup: textModuleDraft,
            isEditing: editingTextModuleId === module._id,
            onCancelDraft: onTextDraftCancel,
            onDraftChange: onTextDraftChange,
            onSaveDraft: () => onTextDraftSave(module._id),
          }
      : {}

  return cloneElement(content, {
    className: nextClassName,
    ...moduleEditingProps,
    onDoubleClick: isEditing
      ? undefined
      : (event: ReactMouseEvent<HTMLElement>) => {
          const target = event.target as HTMLElement | null

          if (target?.closest('.module__card-controls')) {
            return
          }

          onEdit(module)
        },
    children: (
      <>
        {existingChildren}
        <div className="module__card-controls">
          <button
            type="button"
            className="module__card-control"
            aria-label="Modul verschieben"
            onPointerDown={(event) => onMove(sectionId, module, event)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2l2.8 2.8-1.8 1.8H11V4.6L9.2 6.4 7.4 4.6 12 2zm0 20l-4.6-4.6 1.8-1.8L11 17.4v-2.8h2v2.8l1.8-1.8 1.8 1.8L12 22zM2 12l4.6-4.6 1.8 1.8L6.6 11H9v2H6.6l1.8 1.8-1.8 1.8L2 12zm20 0l-4.6 4.6-1.8-1.8 1.8-1.8H15v-2h2.4l-1.8-1.8 1.8-1.8L22 12z" />
            </svg>
          </button>
          <button
            type="button"
            className="module__card-control"
            aria-label="Modul bearbeiten"
            onClick={() => onEdit(module)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15.2 5.2l3.6 3.6-9.9 9.9-4.3.7.7-4.3 9.9-9.9zm1.4-1.4l1.6-1.6c.6-.6 1.6-.6 2.2 0l1.6 1.6c.6.6.6 1.6 0 2.2L22.4 7.6l-5.8-5.8z" />
            </svg>
          </button>
          <button
            type="button"
            className="module__card-control"
            aria-label="Modul konfigurieren"
            onClick={() => onOpenConfig(module)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19.14 12.94c.04-.31.06-.62.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.58.23-1.13.54-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.65 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.62-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.31.6.22l2.39-.96c.5.4 1.05.72 1.63.94l.36 2.54c.04.24.25.42.5.42h3.84c.25 0 .46-.18.5-.42l.36-2.54c.58-.23 1.13-.54 1.63-.94l2.39.96c.22.09.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z" />
            </svg>
          </button>
          <button
            type="button"
            className="module__card-control"
            aria-label="Modul loeschen"
            onClick={() => onDelete(moduleId)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4 6.4 5z" />
            </svg>
          </button>
        </div>
        {isConfiguring ? (
          <div className="module__config-popover admin-surface">
            <p className="module__config-title mb-0">Configuration</p>
            <label className="module__config-field">
              <span>Bootstrap Einrueckung</span>
              <select
                className="admin-text-input module__config-select"
                value={moduleOffsetDraft}
                onChange={(event) =>
                  onOffsetDraftChange(event.target.value as '' | 'offset-md-1' | 'offset-md-2')
                }
              >
                <option value="">Keine</option>
                <option value="offset-md-1">offset-md-1</option>
                <option value="offset-md-2">offset-md-2</option>
              </select>
            </label>
            <label className="module__config-field">
              <span>Bootstrap Breite</span>
              <select
                className="admin-text-input module__config-select"
                value={moduleWidthDraft}
                onChange={(event) =>
                  onWidthDraftChange(event.target.value as 'col-md-12' | 'col-md-8' | 'col-md-6' | 'col-md-4' | 'col-md-3')
                }
              >
                <option value="col-md-12">col-md-12</option>
                <option value="col-md-8">col-md-8</option>
                <option value="col-md-6">col-md-6</option>
                <option value="col-md-4">col-md-4</option>
                <option value="col-md-3">col-md-3</option>
              </select>
            </label>
            <div className="module__rte-actions">
              <button
                type="button"
                className="module__edit-action module__edit-action--confirm"
                aria-label="Konfiguration speichern"
                title="Konfiguration speichern"
                onClick={() => onSaveConfig(module._id)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9.2 16.6 4.6 12l1.4-1.4 3.2 3.2 8.8-8.8 1.4 1.4-10.2 10.2z" />
                </svg>
              </button>
              <button
                type="button"
                className="module__edit-action"
                aria-label="Konfiguration schliessen"
                title="Konfiguration schliessen"
                onClick={onCloseConfig}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4 6.4 5z" />
                </svg>
              </button>
            </div>
          </div>
        ) : null}
      </>
    ),
  })
}

function SectionGroup({ index, isAuthenticated, section, admin }: SectionGroupProps) {
  const {
    activeModuleDropSectionId,
    draggedSectionId,
    dropIndicatorIndex,
    editingSectionId,
    configuringModuleId,
    handleInsertSectionAfter,
    handleCloseModuleConfig,
    handleOpenModuleConfig,
    handlePointerDragStart,
    handleStartEditingModule,
    handleRemoveModule,
    handleSaveHeadlineModule,
    editingImageModuleId,
    handleSaveTextModule,
    handleSectionModulePointerDragStart,
    isValidDropIndex,
    isValidModuleDropIndex,
    editingHeadlineModuleId,
    headlineModuleTypeDraft,
    moduleOffsetDraft,
    moduleWidthDraft,
    editingTextModuleId,
    handleCancelEditingHeadlineModule,
    handleCancelEditingTextModule,
    headlineModuleDraft,
    moduleDropIndicatorIndex,
    moduleDropZoneRefs,
    sectionNameDrafts,
    sectionRefs,
    sections,
    setEditingSectionId,
    setHeadlineModuleTypeDraft,
    setHeadlineModuleDraft,
    setModuleOffsetDraft,
    setModuleWidthDraft,
    setTextModuleDraft,
    setSectionNameDrafts,
    setSectionPendingDelete,
    textModuleDraft,
    updateSectionNameRequest,
  } = admin

  const isModuleReorderSectionActive = admin.draggedSectionModuleSectionId === section.id

  return (
    <>
      {draggedSectionId !== null && isValidDropIndex(index, sections) ? (
        <div className={`section__drop-zone${dropIndicatorIndex === index ? ' section__drop-zone--active' : ''}`} />
      ) : null}
      <section
        id={`section-${section.id}`}
        className={`container section content-container${isAuthenticated ? ' section--admin' : ''}${
          draggedSectionId === section.id ? ' section--dragging' : ''
        }`}
        ref={(element) => {
          sectionRefs.current[section.id] = element
        }}
      >
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
                  <span className="section__name-label">{section.name.trim() || 'Section'}</span>
                  <svg className="section__name-edit-icon" viewBox="0 0 24 24" aria-hidden="true">
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
        <div className={`row content${isAuthenticated ? ' module__content-row--admin' : ''}`}>
          {section.modules.map((module, index) => (
            <Fragment key={module._id}>
              {isModuleReorderSectionActive && isValidModuleDropIndex(section.id, index, sections) ? (
                <div
                  className={`module__reorder-drop-zone${
                    moduleDropIndicatorIndex === index ? ' module__reorder-drop-zone--active' : ''
                  }`}
                />
              ) : null}
              {isAuthenticated
                ? enhanceModuleCard(
                    renderSectionModule(section, module),
                    section.id,
                    module,
                    admin.draggedSectionModuleId === module._id,
                    handleSectionModulePointerDragStart,
                    handleStartEditingModule,
                    configuringModuleId,
                    moduleWidthDraft,
                    moduleOffsetDraft,
                    handleOpenModuleConfig,
                    handleCloseModuleConfig,
                    setModuleWidthDraft,
                    setModuleOffsetDraft,
                    admin.handleSaveModuleConfig,
                    editingHeadlineModuleId,
                    headlineModuleTypeDraft,
                    headlineModuleDraft,
                    setHeadlineModuleDraft,
                    handleCancelEditingHeadlineModule,
                    setHeadlineModuleTypeDraft,
                    handleSaveHeadlineModule,
                    editingImageModuleId,
                    editingTextModuleId,
                    textModuleDraft,
                    setTextModuleDraft,
                    handleCancelEditingTextModule,
                    handleSaveTextModule,
                    module._id,
                    handleRemoveModule
                  )
                : renderSectionModule(section, module)}
            </Fragment>
          ))}
          {isModuleReorderSectionActive && isValidModuleDropIndex(section.id, section.modules.length, sections) ? (
            <div
              className={`module__reorder-drop-zone${
                moduleDropIndicatorIndex === section.modules.length ? ' module__reorder-drop-zone--active' : ''
              }`}
            />
          ) : null}
          {isAuthenticated ? (
            <div
              className={`col-12 module__drop-zone${
                activeModuleDropSectionId === section.id ? ' module__drop-zone--active' : ''
              }`}
              ref={(element) => {
                moduleDropZoneRefs.current[section.id] = element
              }}
              aria-hidden="true"
            />
          ) : null}
        </div>
      </section>
    </>
  )
}

export function SectionsView({ isAuthenticated, admin }: SectionsViewProps) {
  const { draggedSectionId, dropIndicatorIndex, isValidDropIndex, sections } = admin

  return (
    <>
      {sections.map((section, index) => (
        <SectionGroup
          key={section.id}
          index={index}
          isAuthenticated={isAuthenticated}
          section={section}
          admin={admin}
        />
      ))}
      {draggedSectionId !== null && isValidDropIndex(sections.length, sections) ? (
        <div className={`section__drop-zone${dropIndicatorIndex === sections.length ? ' section__drop-zone--active' : ''}`} />
      ) : null}
    </>
  )
}

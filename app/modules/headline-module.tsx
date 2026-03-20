import type { MouseEventHandler, ReactNode } from 'react'

type HeadlineModuleProps = {
  children?: ReactNode
  className?: string
  draftHeadlineType?: 'h1' | 'h2' | 'h3'
  draftText?: string
  headlineType?: 'h1' | 'h2' | 'h3'
  isEditing?: boolean
  onDoubleClick?: MouseEventHandler<HTMLDivElement>
  onDraftCancel?: () => void
  onDraftHeadlineTypeChange?: (value: 'h1' | 'h2' | 'h3') => void
  onDraftChange?: (value: string) => void
  onSaveDraft?: () => void
  text?: string
}

export function HeadlineModule({
  children,
  className = '',
  draftHeadlineType = 'h2',
  draftText = '',
  headlineType = 'h2',
  isEditing = false,
  onDoubleClick,
  onDraftCancel,
  onDraftHeadlineTypeChange,
  onDraftChange,
  onSaveDraft,
  text = 'Headline',
}: HeadlineModuleProps) {
  const Tag = headlineType

  return (
    <div
      className={`col-12 module__card module__card--admin ${className}`.trim()}
      onDoubleClick={onDoubleClick}
    >
      {isEditing ? (
        <div className="module__headline-editor">
          <input
            className="admin-text-input module__headline-input"
            type="text"
            value={draftText}
            autoFocus
            onChange={(event) => onDraftChange?.(event.target.value)}
          />
          <select
            className="admin-text-input module__headline-select"
            value={draftHeadlineType}
            onChange={(event) =>
              onDraftHeadlineTypeChange?.(event.target.value as 'h1' | 'h2' | 'h3')
            }
          >
            <option value="h1">H1</option>
            <option value="h2">H2</option>
            <option value="h3">H3</option>
          </select>
          <div className="module__edit-actions">
            <button
              type="button"
              className="module__edit-action module__edit-action--confirm"
              aria-label="Headline speichern"
              title="Headline speichern"
              onClick={onSaveDraft}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9.2 16.6 4.6 12l1.4-1.4 3.2 3.2 8.8-8.8 1.4 1.4-10.2 10.2z" />
              </svg>
            </button>
            <button
              type="button"
              className="module__edit-action"
              aria-label="Headline verwerfen"
              title="Headline verwerfen"
              onClick={onDraftCancel}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4 6.4 5z" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <Tag>{text}</Tag>
      )}
      {children}
    </div>
  )
}

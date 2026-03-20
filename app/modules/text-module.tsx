import { useEffect, useRef, useState } from 'react'
import type { ClipboardEvent, MouseEventHandler, ReactNode } from 'react'

type TextModuleProps = {
  children?: ReactNode
  className?: string
  draftMarkup?: string
  isEditing?: boolean
  markup?: string
  onDoubleClick?: MouseEventHandler<HTMLDivElement>
  onCancelDraft?: () => void
  onDraftChange?: (value: string) => void
  onSaveDraft?: () => void
}

export function TextModule({
  children,
  className = '',
  draftMarkup = '<p></p>',
  isEditing = false,
  markup = '<p></p>',
  onDoubleClick,
  onCancelDraft,
  onDraftChange,
  onSaveDraft,
}: TextModuleProps) {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const [isCodeView, setIsCodeView] = useState(false)
  const normalizedMarkup = markup.trim()
  const hasVisibleContent =
    normalizedMarkup !== '' &&
    normalizedMarkup !== '<p></p>' &&
    normalizedMarkup !== '<p><br></p>'

  useEffect(() => {
    if (!isEditing || !editorRef.current) {
      return
    }

    document.execCommand('defaultParagraphSeparator', false, 'p')

    if (editorRef.current.innerHTML !== draftMarkup) {
      editorRef.current.innerHTML = draftMarkup
    }
  }, [draftMarkup, isEditing])

  useEffect(() => {
    if (!isEditing) {
      setIsCodeView(false)
    }
  }, [isEditing])

  function applyCommand(command: 'bold' | 'italic' | 'insertOrderedList' | 'insertUnorderedList') {
    editorRef.current?.focus()
    document.execCommand(command)
    onDraftChange?.(editorRef.current?.innerHTML ?? draftMarkup)
  }

  function handleLink() {
    const url = window.prompt('Link URL')

    if (!url) {
      return
    }

    editorRef.current?.focus()
    document.execCommand('createLink', false, url)
    onDraftChange?.(editorRef.current?.innerHTML ?? draftMarkup)
  }

  function applyBlockFormat(tagName: 'p' | 'h2' | 'h3') {
    editorRef.current?.focus()
    document.execCommand('formatBlock', false, tagName)
    onDraftChange?.(editorRef.current?.innerHTML ?? draftMarkup)
  }

  function sanitizeMarkup(value: string) {
    const parser = new DOMParser()
    const documentFragment = parser.parseFromString(value, 'text/html')

    function sanitizeNode(node: ChildNode): string {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent ?? ''
      }

      if (!(node instanceof HTMLElement)) {
        return ''
      }

      const sanitizedChildren = Array.from(node.childNodes)
        .map((childNode) => sanitizeNode(childNode))
        .join('')

      if (node.tagName === 'BR') {
        return '<br>'
      }

      if (node.tagName === 'UL' || node.tagName === 'OL') {
        return `<${node.tagName.toLowerCase()}>${sanitizedChildren}</${node.tagName.toLowerCase()}>`
      }

      if (node.tagName === 'LI') {
        return `<li>${sanitizedChildren}</li>`
      }

      if (node.tagName === 'P' || node.tagName === 'DIV') {
        return sanitizedChildren.trim() ? `<p>${sanitizedChildren}</p>` : '<p><br></p>'
      }

      return sanitizedChildren
    }

    const sanitizedMarkup = Array.from(documentFragment.body.childNodes)
      .map((childNode) => sanitizeNode(childNode))
      .join('')

    return sanitizedMarkup || '<p></p>'
  }

  function insertHtmlAtCursor(value: string) {
    editorRef.current?.focus()
    document.execCommand('insertHTML', false, value)
    onDraftChange?.(editorRef.current?.innerHTML ?? draftMarkup)
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault()

    const html = event.clipboardData.getData('text/html')
    const plainText = event.clipboardData.getData('text/plain')

    if (html) {
      insertHtmlAtCursor(sanitizeMarkup(html))
      return
    }

    const normalizedText = plainText
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.split('\n').join('<br>'))
      .join('</p><p>')

    insertHtmlAtCursor(normalizedText ? `<p>${normalizedText}</p>` : '<p></p>')
  }

  function handleToggleCodeView() {
    if (!isCodeView && editorRef.current) {
      onDraftChange?.(editorRef.current.innerHTML || draftMarkup)
    }

    setIsCodeView((currentValue) => !currentValue)
  }

  return (
    <div
      className={`col-12 module__card module__card--admin ${className}`.trim()}
      onDoubleClick={onDoubleClick}
    >
      {isEditing ? (
        <div className="module__rte admin-surface">
          <div className="module__rte-toolbar">
            <select
              className="admin-text-input module__rte-format-select"
              aria-label="Blockformat"
              defaultValue="p"
              onChange={(event) => applyBlockFormat(event.target.value as 'p' | 'h2' | 'h3')}
            >
              <option value="p">Paragraph</option>
              <option value="h2">Ueberschrift 2</option>
              <option value="h3">Ueberschrift 3</option>
            </select>
            <button
              type="button"
              className="module__rte-button"
              aria-label="HTML-Code Ansicht"
              title="HTML-Code Ansicht"
              onClick={handleToggleCodeView}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8.7 16.6-1.4 1.4L1.3 12l6-6 1.4 1.4L4.1 12l4.6 4.6zm6.6 0L19.9 12l-4.6-4.6L16.7 6l6 6-6 6-1.4-1.4zM13.9 4l-3.2 16h-2.1l3.2-16h2.1z" />
              </svg>
            </button>
            <button
              type="button"
              className="module__rte-button"
              aria-label="Fett"
              title="Fett"
              onClick={() => applyCommand('bold')}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5h5.5a4 4 0 0 1 2.7 6.9A4.5 4.5 0 0 1 13 19H8V5zm3 2v4h2.2a2 2 0 1 0 0-4H11zm0 6v4h2.5a2 2 0 1 0 0-4H11z" />
              </svg>
            </button>
            <button
              type="button"
              className="module__rte-button"
              aria-label="Kursiv"
              title="Kursiv"
              onClick={() => applyCommand('italic')}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10 5v2h2.6l-3.2 10H7v2h7v-2h-2.6l3.2-10H17V5h-7z" />
              </svg>
            </button>
            <button
              type="button"
              className="module__rte-button"
              aria-label="Nummerierte Liste"
              title="Nummerierte Liste"
              onClick={() => applyCommand('insertOrderedList')}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10 6h10v2H10V6zm0 5h10v2H10v-2zm0 5h10v2H10v-2zM4 5h2v5H4V8H2V6h2V5zm-1 8c0-1.1.9-2 2-2s2 .9 2 2c0 .6-.3 1.1-.7 1.5L5 16h2v2H2v-1.4l2.2-2.2c.3-.3.8-.7.8-1.1 0-.3-.2-.5-.5-.5s-.5.2-.5.5H3z" />
              </svg>
            </button>
            <button
              type="button"
              className="module__rte-button"
              aria-label="Aufzaehlung"
              title="Aufzaehlung"
              onClick={() => applyCommand('insertUnorderedList')}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 6h11v2H9V6zm0 5h11v2H9v-2zm0 5h11v2H9v-2zM5 7.5A1.5 1.5 0 1 1 2 7.5a1.5 1.5 0 0 1 3 0zm0 5A1.5 1.5 0 1 1 2 12.5a1.5 1.5 0 0 1 3 0zm0 5A1.5 1.5 0 1 1 2 17.5a1.5 1.5 0 0 1 3 0z" />
              </svg>
            </button>
            <button
              type="button"
              className="module__rte-button"
              aria-label="Link einfuegen"
              title="Link einfuegen"
              onClick={handleLink}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10.6 13.4a1 1 0 0 1 0-1.4l4-4a3 3 0 1 1 4.2 4.2l-2.3 2.3-1.4-1.4 2.3-2.3a1 1 0 1 0-1.4-1.4l-4 4a1 1 0 0 1-1.4 0zm2.8-2.8a1 1 0 0 1 0 1.4l-4 4a3 3 0 1 1-4.2-4.2l2.3-2.3 1.4 1.4-2.3 2.3a1 1 0 1 0 1.4 1.4l4-4a1 1 0 0 1 1.4 0z" />
              </svg>
            </button>
          </div>
          {isCodeView ? (
            <textarea
              className="module__rte-code-input"
              value={draftMarkup}
              onChange={(event) => onDraftChange?.(event.target.value)}
            />
          ) : (
            <div
              ref={editorRef}
              className="module__rte-editor"
              contentEditable
              suppressContentEditableWarning
              onInput={(event) => onDraftChange?.(event.currentTarget.innerHTML)}
              onPaste={handlePaste}
            />
          )}
          <div className="module__rte-actions">
            <button
              type="button"
              className="module__edit-action module__edit-action--confirm"
              aria-label="Text speichern"
              title="Text speichern"
              onClick={onSaveDraft}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9.2 16.6 4.6 12l1.4-1.4 3.2 3.2 8.8-8.8 1.4 1.4-10.2 10.2z" />
              </svg>
            </button>
            <button
              type="button"
              className="module__edit-action"
              aria-label="Text verwerfen"
              title="Text verwerfen"
              onClick={onCancelDraft}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4 6.4 5z" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        hasVisibleContent ? (
          <div
            className="module__text-content"
            dangerouslySetInnerHTML={{ __html: markup }}
          />
        ) : (
          <div className="module__text-placeholder">Beispieltext ...</div>
        )
      )}
      {children}
    </div>
  )
}

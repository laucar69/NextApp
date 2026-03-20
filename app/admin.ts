'use client'

import type { PointerEvent as ReactPointerEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { SectionItem, SectionModuleItem } from './global'
import type { AvailableModuleItem } from './modules'

const DEFAULT_PAGE_ID = 0

export function useAdminController() {
  const [sections, setSections] = useState<SectionItem[]>([])
  const [draggedSectionId, setDraggedSectionId] = useState<number | null>(null)
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null)
  const [draggedAvailableModule, setDraggedAvailableModule] = useState<AvailableModuleItem | null>(null)
  const [activeModuleDropSectionId, setActiveModuleDropSectionId] = useState<number | null>(null)
  const [draggedSectionModuleId, setDraggedSectionModuleId] = useState<string | null>(null)
  const [draggedSectionModuleSectionId, setDraggedSectionModuleSectionId] = useState<number | null>(null)
  const [moduleDropIndicatorIndex, setModuleDropIndicatorIndex] = useState<number | null>(null)
  const [editingHeadlineModuleId, setEditingHeadlineModuleId] = useState<string | null>(null)
  const [headlineModuleDraft, setHeadlineModuleDraft] = useState('')
  const [headlineModuleTypeDraft, setHeadlineModuleTypeDraft] = useState<'h1' | 'h2' | 'h3'>('h2')
  const [editingTextModuleId, setEditingTextModuleId] = useState<string | null>(null)
  const [textModuleDraft, setTextModuleDraft] = useState('<p></p>')
  const [configuringModuleId, setConfiguringModuleId] = useState<string | null>(null)
  const [moduleWidthDraft, setModuleWidthDraft] = useState<'col-md-12' | 'col-md-8' | 'col-md-6' | 'col-md-4' | 'col-md-3'>('col-md-12')
  const [moduleOffsetDraft, setModuleOffsetDraft] = useState<'' | 'offset-md-1' | 'offset-md-2'>('')
  const [sectionPendingDelete, setSectionPendingDelete] = useState<number | null>(null)
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null)
  const [sectionNameDrafts, setSectionNameDrafts] = useState<Record<number, string>>({})
  const [dragPreviewPosition, setDragPreviewPosition] = useState<{
    x: number
    y: number
    width: number
  } | null>(null)
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const moduleDropZoneRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const autoScrollFrameRef = useRef<number | null>(null)
  const autoScrollSpeedRef = useRef(0)
  const pointerPositionRef = useRef<{ x: number; y: number } | null>(null)

  const loadSections = useCallback(async function loadSections() {
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
  }, [])

  const getDraggedSectionIndex = useCallback(
    (currentSections: SectionItem[]) => {
      if (draggedSectionId === null) {
        return -1
      }

      return currentSections.findIndex((section) => section.id === draggedSectionId)
    },
    [draggedSectionId]
  )

  const isValidDropIndex = useCallback(
    (targetIndex: number, currentSections: SectionItem[]) => {
      const draggedIndex = getDraggedSectionIndex(currentSections)

      if (draggedIndex === -1) {
        return true
      }

      return targetIndex !== draggedIndex && targetIndex !== draggedIndex + 1
    },
    [getDraggedSectionIndex]
  )

  const getNormalizedDropIndex = useCallback(
    (targetIndex: number, currentSections: SectionItem[]) => {
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
    },
    [getDraggedSectionIndex]
  )

  const stopAutoScroll = useCallback(() => {
    autoScrollSpeedRef.current = 0

    if (autoScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(autoScrollFrameRef.current)
      autoScrollFrameRef.current = null
    }
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedSectionId(null)
    setDropIndicatorIndex(null)
    setDragPreviewPosition(null)
    stopAutoScroll()
  }, [stopAutoScroll])

  const handleModuleDragEnd = useCallback(() => {
    setDraggedAvailableModule(null)
    setActiveModuleDropSectionId(null)
    setDragPreviewPosition(null)
    stopAutoScroll()
  }, [stopAutoScroll])

  const handleSectionModuleDragEnd = useCallback(() => {
    setDraggedSectionModuleId(null)
    setDraggedSectionModuleSectionId(null)
    setModuleDropIndicatorIndex(null)
    setDragPreviewPosition(null)
    stopAutoScroll()
  }, [stopAutoScroll])

  const updateDragPreviewPosition = useCallback((clientX: number, clientY: number) => {
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
  }, [])

  const updateDropIndicatorFromPointer = useCallback(
    (pointerClientY: number) => {
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
    },
    [getNormalizedDropIndex, isValidDropIndex, sections]
  )

  const updateModuleDropZoneFromPointer = useCallback(
    (pointerClientX: number, pointerClientY: number) => {
      let nextSectionId: number | null = null

      for (const section of sections) {
        const dropZoneElement = moduleDropZoneRefs.current[section.id]

        if (!dropZoneElement) {
          continue
        }

        const bounds = dropZoneElement.getBoundingClientRect()

        if (
          pointerClientX >= bounds.left &&
          pointerClientX <= bounds.right &&
          pointerClientY >= bounds.top &&
          pointerClientY <= bounds.bottom
        ) {
          nextSectionId = section.id
          break
        }
      }

      setActiveModuleDropSectionId(nextSectionId)
    },
    [sections]
  )

  const getDraggedSectionModuleIndex = useCallback(
    (sectionId: number, currentSections: SectionItem[]) => {
      if (!draggedSectionModuleId || draggedSectionModuleSectionId !== sectionId) {
        return -1
      }

      const section = currentSections.find((entry) => entry.id === sectionId)

      if (!section) {
        return -1
      }

      return section.modules.findIndex((module) => module._id === draggedSectionModuleId)
    },
    [draggedSectionModuleId, draggedSectionModuleSectionId]
  )

  const isValidModuleDropIndex = useCallback(
    (sectionId: number, targetIndex: number, currentSections: SectionItem[]) => {
      const draggedIndex = getDraggedSectionModuleIndex(sectionId, currentSections)

      if (draggedIndex === -1) {
        return false
      }

      return targetIndex !== draggedIndex && targetIndex !== draggedIndex + 1
    },
    [getDraggedSectionModuleIndex]
  )

  const getNormalizedModuleDropIndex = useCallback(
    (sectionId: number, targetIndex: number, currentSections: SectionItem[]) => {
      const draggedIndex = getDraggedSectionModuleIndex(sectionId, currentSections)

      if (draggedIndex === -1) {
        return targetIndex
      }

      if (targetIndex === draggedIndex) {
        return Math.max(0, draggedIndex - 1)
      }

      if (targetIndex === draggedIndex + 1) {
        return Math.min(currentSections.find((section) => section.id === sectionId)?.modules.length ?? 0, draggedIndex + 2)
      }

      return targetIndex
    },
    [getDraggedSectionModuleIndex]
  )

  const updateSectionModuleDropIndicatorFromPointer = useCallback(
    (pointerClientY: number) => {
      if (draggedSectionModuleSectionId === null) {
        return
      }

      const section = sections.find((entry) => entry.id === draggedSectionModuleSectionId)
      const sectionElement = sectionRefs.current[draggedSectionModuleSectionId]

      if (!section || !sectionElement) {
        return
      }

      const moduleElements = Array.from(sectionElement.querySelectorAll<HTMLElement>('.module__card'))
      let rawDropIndex = section.modules.length

      for (let index = 0; index < moduleElements.length; index += 1) {
        const bounds = moduleElements[index].getBoundingClientRect()
        const moduleMidpoint = bounds.top + bounds.height / 2

        if (pointerClientY < moduleMidpoint) {
          rawDropIndex = index
          break
        }
      }

      const nextDropIndex = getNormalizedModuleDropIndex(
        draggedSectionModuleSectionId,
        rawDropIndex,
        sections
      )

      if (isValidModuleDropIndex(draggedSectionModuleSectionId, nextDropIndex, sections)) {
        setModuleDropIndicatorIndex(nextDropIndex)
      }
    },
    [
      draggedSectionModuleSectionId,
      getNormalizedModuleDropIndex,
      isValidModuleDropIndex,
      sections,
    ]
  )

  const runAutoScroll = useCallback(() => {
    if (autoScrollSpeedRef.current === 0) {
      autoScrollFrameRef.current = null
      return
    }

    window.scrollBy({
      top: autoScrollSpeedRef.current,
      behavior: 'auto',
    })

    if (pointerPositionRef.current) {
      updateDragPreviewPosition(pointerPositionRef.current.x, pointerPositionRef.current.y)

      if (draggedSectionId !== null) {
        updateDropIndicatorFromPointer(pointerPositionRef.current.y)
      } else if (draggedAvailableModule) {
        updateModuleDropZoneFromPointer(pointerPositionRef.current.x, pointerPositionRef.current.y)
      } else if (draggedSectionModuleId) {
        updateSectionModuleDropIndicatorFromPointer(pointerPositionRef.current.y)
      }
    }

    autoScrollFrameRef.current = window.requestAnimationFrame(runAutoScroll)
  }, [
    draggedAvailableModule,
    draggedSectionModuleId,
    draggedSectionModuleSectionId,
    draggedSectionId,
    updateDragPreviewPosition,
    updateDropIndicatorFromPointer,
    updateSectionModuleDropIndicatorFromPointer,
    updateModuleDropZoneFromPointer,
  ])

  const maybeAutoScroll = useCallback(
    (pointerClientY: number) => {
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
    },
    [runAutoScroll, stopAutoScroll]
  )

  const reorderSectionsRequest = useCallback(
    async (orderedSectionIds: number[]) => {
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
    },
    [loadSections]
  )

  const handleDrop = useCallback(
    (targetIndex: number) => {
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
    },
    [draggedSectionId, getNormalizedDropIndex, handleDragEnd, reorderSectionsRequest, sections]
  )

  useEffect(() => {
    void loadSections()

    return () => {
      if (autoScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(autoScrollFrameRef.current)
      }
    }
  }, [loadSections])

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
  }, [
    draggedSectionId,
    dropIndicatorIndex,
    handleDragEnd,
    handleDrop,
    maybeAutoScroll,
    updateDragPreviewPosition,
    updateDropIndicatorFromPointer,
  ])

  useEffect(() => {
    if (!draggedAvailableModule) {
      return
    }

    function handlePointerMove(event: PointerEvent) {
      pointerPositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      }

      updateDragPreviewPosition(event.clientX, event.clientY)
      maybeAutoScroll(event.clientY)
      updateModuleDropZoneFromPointer(event.clientX, event.clientY)
    }

    function handlePointerUp() {
      if (activeModuleDropSectionId !== null) {
        void addModuleToSectionRequest(activeModuleDropSectionId, draggedAvailableModule)
        return
      }

      handleModuleDragEnd()
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [
    activeModuleDropSectionId,
    draggedAvailableModule,
    handleModuleDragEnd,
    maybeAutoScroll,
    updateDragPreviewPosition,
    updateModuleDropZoneFromPointer,
  ])

  useEffect(() => {
    if (!draggedSectionModuleId || draggedSectionModuleSectionId === null) {
      return
    }

    function handlePointerMove(event: PointerEvent) {
      pointerPositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      }

      updateDragPreviewPosition(event.clientX, event.clientY)
      maybeAutoScroll(event.clientY)
      updateSectionModuleDropIndicatorFromPointer(event.clientY)
    }

    function handlePointerUp() {
      if (moduleDropIndicatorIndex !== null) {
        void handleSectionModuleDrop(moduleDropIndicatorIndex)
        return
      }

      handleSectionModuleDragEnd()
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [
    draggedSectionModuleId,
    draggedSectionModuleSectionId,
    handleSectionModuleDragEnd,
    maybeAutoScroll,
    moduleDropIndicatorIndex,
    updateDragPreviewPosition,
    updateSectionModuleDropIndicatorFromPointer,
  ])

  const handleAddSection = useCallback(() => {
    void createSectionRequest(null)
  }, [])

  const handleInsertSectionAfter = useCallback((sectionId: number) => {
    void createSectionRequest(sectionId)
  }, [])

  const handleConfirmRemoveSection = useCallback(async () => {
    if (sectionPendingDelete === null) {
      return
    }

    setSectionPendingDelete(null)
    await removeSectionRequest(sectionPendingDelete)
  }, [sectionPendingDelete])

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

  async function addModuleToSectionRequest(sectionId: number, module: AvailableModuleItem) {
    const temporaryModuleId = `temp-${sectionId}-${module.key}-${Date.now()}`

    setSections((currentSections) =>
      currentSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              modules: [
                ...section.modules,
                {
                  _id: temporaryModuleId,
                  section_id: section._id,
                  modulname: module.key,
                  position: section.modules.length + 1,
                },
              ],
            }
          : section
      )
    )

    handleModuleDragEnd()

    try {
      const response = await fetch(`/api/sections/${sectionId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modulname: module.key,
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Modul konnte nicht hinzugefuegt werden.')
      }

      setSections(result.sections ?? [])
    } catch (error) {
      console.error(error)
      await loadSections()
    }
  }

  const reorderSectionModulesRequest = useCallback(
    async (sectionId: number, orderedModuleIds: string[]) => {
      try {
        const response = await fetch(`/api/sections/${sectionId}/modules`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ordered_module_ids: orderedModuleIds,
          }),
        })
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Modul-Reihenfolge konnte nicht gespeichert werden.')
        }

        setSections(result.sections ?? [])
      } catch (error) {
        console.error(error)
        await loadSections()
      }
    },
    [loadSections]
  )

  const handleSectionModuleDrop = useCallback(
    async (targetIndex: number) => {
      if (!draggedSectionModuleId || draggedSectionModuleSectionId === null) {
        return
      }

      const section = sections.find((entry) => entry.id === draggedSectionModuleSectionId)

      if (!section) {
        handleSectionModuleDragEnd()
        return
      }

      const normalizedTargetIndex = getNormalizedModuleDropIndex(
        draggedSectionModuleSectionId,
        targetIndex,
        sections
      )
      const fromIndex = section.modules.findIndex((module) => module._id === draggedSectionModuleId)

      if (fromIndex === -1) {
        handleSectionModuleDragEnd()
        return
      }

      const nextModules = [...section.modules]
      const [draggedSectionModule] = nextModules.splice(fromIndex, 1)
      const insertIndex =
        fromIndex < normalizedTargetIndex ? normalizedTargetIndex - 1 : normalizedTargetIndex

      nextModules.splice(insertIndex, 0, draggedSectionModule)

      setSections((currentSections) =>
        currentSections.map((entry) =>
          entry.id === draggedSectionModuleSectionId
            ? {
                ...entry,
                modules: nextModules.map((module, index) => ({
                  ...module,
                  position: index + 1,
                })),
              }
            : entry
        )
      )

      handleSectionModuleDragEnd()
      await reorderSectionModulesRequest(
        draggedSectionModuleSectionId,
        nextModules.map((module) => module._id)
      )
    },
    [
      draggedSectionModuleId,
      draggedSectionModuleSectionId,
      getNormalizedModuleDropIndex,
      handleSectionModuleDragEnd,
      reorderSectionModulesRequest,
      sections,
    ]
  )

  const handleRemoveModule = useCallback(
    async (moduleId: string) => {
      const previousSections = sections

      setSections((currentSections) =>
        currentSections.map((section) => ({
          ...section,
          modules: section.modules.filter((module) => module._id !== moduleId),
        }))
      )

      try {
        const response = await fetch(`/api/modules/${moduleId}`, {
          method: 'DELETE',
        })
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Modul konnte nicht geloescht werden.')
        }

        setSections(result.sections ?? [])
      } catch (error) {
        console.error(error)
        setSections(previousSections)
        await loadSections()
      }
    },
    [loadSections, sections]
  )

  const handleOpenModuleConfig = useCallback((module: SectionModuleItem) => {
    setConfiguringModuleId(module._id)
    setModuleWidthDraft(module.bootstrap_width ?? 'col-md-12')
    setModuleOffsetDraft(module.bootstrap_offset ?? '')
  }, [])

  const handleCloseModuleConfig = useCallback(() => {
    setConfiguringModuleId(null)
    setModuleWidthDraft('col-md-12')
    setModuleOffsetDraft('')
  }, [])

  const handleStartEditingHeadlineModule = useCallback((module: SectionModuleItem) => {
    if (module.modulname !== 'headline-module') {
      return
    }

    setEditingTextModuleId(null)
    setTextModuleDraft('<p></p>')
    setEditingHeadlineModuleId(module._id)
    setHeadlineModuleDraft(
      module.content && 'text' in module.content ? module.content.text : 'Headline'
    )
    setHeadlineModuleTypeDraft(
      module.content && 'headline_type' in module.content ? module.content.headline_type : 'h2'
    )
  }, [])

  const handleCancelEditingHeadlineModule = useCallback(() => {
    setEditingHeadlineModuleId(null)
    setHeadlineModuleDraft('')
    setHeadlineModuleTypeDraft('h2')
  }, [])

  const handleStartEditingTextModule = useCallback((module: SectionModuleItem) => {
    if (module.modulname !== 'text-module') {
      return
    }

    setEditingHeadlineModuleId(null)
    setHeadlineModuleDraft('')
    setEditingTextModuleId(module._id)
    setTextModuleDraft(
      module.content && 'markup' in module.content ? module.content.markup : '<p></p>'
    )
  }, [])

  const handleCancelEditingTextModule = useCallback(() => {
    setEditingTextModuleId(null)
    setTextModuleDraft('<p></p>')
  }, [])

  const handleStartEditingModule = useCallback(
    (module: SectionModuleItem) => {
      if (module.modulname === 'headline-module') {
        handleStartEditingHeadlineModule(module)
        return
      }

      if (module.modulname === 'text-module') {
        handleStartEditingTextModule(module)
      }
    },
    [handleStartEditingHeadlineModule, handleStartEditingTextModule]
  )

  const handleSaveHeadlineModule = useCallback(
    async (moduleId: string) => {
      const nextText = headlineModuleDraft.trim()

      if (!nextText) {
        handleCancelEditingHeadlineModule()
        await loadSections()
        return
      }

      const currentModule = sections
        .flatMap((section) => section.modules)
        .find((module) => module._id === moduleId && module.modulname === 'headline-module')

      if (!currentModule) {
        handleCancelEditingHeadlineModule()
        return
      }

      setSections((currentSections) =>
        currentSections.map((section) => ({
          ...section,
          modules: section.modules.map((module) =>
            module._id === moduleId
              ? {
                  ...module,
                  content: module.content
                    ? 'text' in module.content
                      ? {
                          ...module.content,
                          text: nextText,
                          headline_type: headlineModuleTypeDraft,
                        }
                      : module.content
                    : {
                        _id: module.content_id ?? '',
                        text: nextText,
                        headline_type: headlineModuleTypeDraft,
                      },
                }
              : module
          ),
        }))
      )
      setEditingHeadlineModuleId(null)
      setHeadlineModuleDraft('')
      setHeadlineModuleTypeDraft('h2')

      try {
        const response = await fetch(`/api/modules/${moduleId}/content`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: nextText,
            headline_type: headlineModuleTypeDraft,
          }),
        })
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Headline konnte nicht gespeichert werden.')
        }

        setSections((currentSections) =>
          currentSections.map((section) => ({
            ...section,
            modules: section.modules.map((module) =>
              module._id === moduleId
                ? {
                    ...module,
                    content_id: result.content?._id ?? module.content_id ?? null,
                    content: result.content ?? module.content ?? null,
                  }
                : module
            ),
          }))
        )
      } catch (error) {
        console.error(error)
        await loadSections()
      }
    },
    [handleCancelEditingHeadlineModule, headlineModuleDraft, headlineModuleTypeDraft, loadSections, sections]
  )

  const handleSaveTextModule = useCallback(
    async (moduleId: string) => {
      const nextMarkup = textModuleDraft || '<p></p>'
      const currentModule = sections
        .flatMap((section) => section.modules)
        .find((module) => module._id === moduleId && module.modulname === 'text-module')

      if (!currentModule) {
        handleCancelEditingTextModule()
        return
      }

      setSections((currentSections) =>
        currentSections.map((section) => ({
          ...section,
          modules: section.modules.map((module) =>
            module._id === moduleId
              ? {
                  ...module,
                  content: module.content
                    ? 'markup' in module.content
                      ? { ...module.content, markup: nextMarkup }
                      : module.content
                    : {
                        _id: module.content_id ?? '',
                        markup: nextMarkup,
                      },
                }
              : module
          ),
        }))
      )
      setEditingTextModuleId(null)
      setTextModuleDraft('<p></p>')

      try {
        const response = await fetch(`/api/modules/${moduleId}/content`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            markup: nextMarkup,
          }),
        })
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Text-Modul konnte nicht gespeichert werden.')
        }

        setSections((currentSections) =>
          currentSections.map((section) => ({
            ...section,
            modules: section.modules.map((module) =>
              module._id === moduleId
                ? {
                    ...module,
                    content_id: result.content?._id ?? module.content_id ?? null,
                    content: result.content ?? module.content ?? null,
                  }
                : module
            ),
          }))
        )
      } catch (error) {
        console.error(error)
        await loadSections()
      }
    },
    [handleCancelEditingTextModule, loadSections, sections, textModuleDraft]
  )

  const handleSaveModuleConfig = useCallback(
    async (moduleId: string) => {
      const widthColumns = Number(moduleWidthDraft.replace('col-md-', ''))
      const offsetColumns = moduleOffsetDraft ? Number(moduleOffsetDraft.replace('offset-md-', '')) : 0

      if (widthColumns + offsetColumns > 12) {
        return
      }

      setSections((currentSections) =>
        currentSections.map((section) => ({
          ...section,
          modules: section.modules.map((module) =>
            module._id === moduleId
              ? {
                  ...module,
                  bootstrap_width: moduleWidthDraft,
                  bootstrap_offset: moduleOffsetDraft,
                }
              : module
          ),
        }))
      )
      handleCloseModuleConfig()

      try {
        const response = await fetch(`/api/modules/${moduleId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bootstrap_width: moduleWidthDraft,
            bootstrap_offset: moduleOffsetDraft,
          }),
        })
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Modul-Konfiguration konnte nicht gespeichert werden.')
        }

        setSections((currentSections) =>
          currentSections.map((section) => ({
            ...section,
            modules: section.modules.map((module) =>
              module._id === moduleId
                ? {
                    ...module,
                    bootstrap_width: result.module?.bootstrap_width ?? module.bootstrap_width ?? 'col-md-12',
                    bootstrap_offset: result.module?.bootstrap_offset ?? module.bootstrap_offset ?? '',
                  }
                : module
            ),
          }))
        )
      } catch (error) {
        console.error(error)
        await loadSections()
      }
    },
    [handleCloseModuleConfig, loadSections, moduleOffsetDraft, moduleWidthDraft]
  )

  const updateSectionNameRequest = useCallback(
    async (sectionId: number) => {
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
    },
    [loadSections, sectionNameDrafts]
  )

  const handlePointerDragStart = useCallback(
    (sectionId: number, event: ReactPointerEvent<HTMLButtonElement>) => {
      const sectionIndex = sections.findIndex((section) => section.id === sectionId)
      const sectionElement = event.currentTarget.closest('section') as HTMLElement | null

      if (!sectionElement) {
        return
      }

      event.preventDefault()
      pointerPositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      }
      setDraggedAvailableModule(null)
      setActiveModuleDropSectionId(null)
      setDraggedSectionModuleId(null)
      setDraggedSectionModuleSectionId(null)
      setModuleDropIndicatorIndex(null)
      setDraggedSectionId(sectionId)
      setDropIndicatorIndex(sectionIndex === -1 ? 0 : sectionIndex)
      setDragPreviewPosition({
        x: event.clientX - 20,
        y: event.clientY - 18,
        width: sectionElement.offsetWidth,
      })
    },
    [sections]
  )

  const handleModulePointerDragStart = useCallback(
    (module: AvailableModuleItem, event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault()
      pointerPositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      }
      setDraggedSectionId(null)
      setDropIndicatorIndex(null)
      setDraggedSectionModuleId(null)
      setDraggedSectionModuleSectionId(null)
      setModuleDropIndicatorIndex(null)
      setDraggedAvailableModule(module)
      setActiveModuleDropSectionId(null)
      setDragPreviewPosition({
        x: event.clientX - 20,
        y: event.clientY - 18,
        width: 220,
      })
    },
    []
  )

  const handleSectionModulePointerDragStart = useCallback(
    (sectionId: number, module: SectionModuleItem, event: ReactPointerEvent<HTMLButtonElement>) => {
      const sectionElement = sectionRefs.current[sectionId]
      const moduleElement = event.currentTarget.closest('.module__card') as HTMLDivElement | null
      const section = sections.find((entry) => entry.id === sectionId)
      const moduleIndex = section?.modules.findIndex((entry) => entry._id === module._id) ?? -1

      if (!moduleElement || !sectionElement || moduleIndex === -1) {
        return
      }

      event.preventDefault()
      pointerPositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      }
      setDraggedSectionId(null)
      setDropIndicatorIndex(null)
      setDraggedAvailableModule(null)
      setActiveModuleDropSectionId(null)
      setDraggedSectionModuleId(module._id)
      setDraggedSectionModuleSectionId(sectionId)
      setModuleDropIndicatorIndex(moduleIndex)
      setDragPreviewPosition({
        x: event.clientX - 20,
        y: event.clientY - 18,
        width: moduleElement.offsetWidth,
      })
    },
    [sections]
  )

  return {
    activeModuleDropSectionId,
    configuringModuleId,
    dragPreviewPosition,
    editingHeadlineModuleId,
    headlineModuleTypeDraft,
    moduleOffsetDraft,
    moduleWidthDraft,
    editingTextModuleId,
    headlineModuleDraft,
    textModuleDraft,
    draggedAvailableModule,
    draggedSectionModuleId,
    draggedSectionModuleSectionId,
    draggedSectionId,
    dropIndicatorIndex,
    editingSectionId,
    handleAddSection,
    handleConfirmRemoveSection,
    handleCloseModuleConfig,
    handleInsertSectionAfter,
    handleOpenModuleConfig,
    handleStartEditingModule,
    handleModulePointerDragStart,
    handlePointerDragStart,
    handleCancelEditingHeadlineModule,
    handleCancelEditingTextModule,
    handleSaveHeadlineModule,
    handleSaveModuleConfig,
    handleSaveTextModule,
    handleSectionModulePointerDragStart,
    handleStartEditingHeadlineModule,
    handleStartEditingTextModule,
    handleRemoveModule,
    handleSectionModuleDragEnd,
    isValidDropIndex,
    isValidModuleDropIndex,
    moduleDropIndicatorIndex,
    moduleDropZoneRefs,
    sectionNameDrafts,
    sectionPendingDelete,
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
    updateSectionNameRequest,
  }
}

export type AdminController = ReturnType<typeof useAdminController>

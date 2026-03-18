import Page from '@/models/Page'
import Section from '@/models/Section'

export const DEFAULT_PAGE = {
  id: 0,
  name: 'default',
  title: 'Roadhouse',
}

export const DEFAULT_SECTION = {
  page_id: 0,
  id: 1,
  position: 1,
  name: '',
}

export async function listSectionsForPage(pageId: number) {
  return Section.find({ page_id: pageId }).sort({ position: 1, id: 1 }).lean()
}

export async function ensureDefaultSiteStructure() {
  const page = await Page.findOneAndUpdate({ id: DEFAULT_PAGE.id }, DEFAULT_PAGE, {
    upsert: true,
    new: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  }).lean()

  let sections = await listSectionsForPage(DEFAULT_PAGE.id)

  if (sections.length === 0) {
    await Section.findOneAndUpdate({ id: DEFAULT_SECTION.id }, DEFAULT_SECTION, {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }).lean()

    sections = await listSectionsForPage(DEFAULT_PAGE.id)
  }

  return {
    page,
    sections,
  }
}

export async function createSection(pageId: number, afterSectionId?: number | null) {
  const existingSections = await listSectionsForPage(pageId)
  const highestSection = await Section.findOne().sort({ id: -1 }).lean()
  const nextSectionId = (highestSection?.id ?? 0) + 1

  let insertIndex = existingSections.length

  if (typeof afterSectionId === 'number') {
    const currentIndex = existingSections.findIndex((section) => section.id === afterSectionId)

    if (currentIndex === -1) {
      throw new Error('Section to insert after was not found.')
    }

    insertIndex = currentIndex + 1
  }

  const nextSections = [...existingSections]

  nextSections.splice(insertIndex, 0, {
    page_id: pageId,
    id: nextSectionId,
    position: insertIndex + 1,
    name: '',
  })

  await Section.bulkWrite(
    nextSections.map((section, index) => ({
      updateOne: {
        filter: { id: section.id },
        update: {
          id: section.id,
          page_id: section.page_id,
          position: index + 1,
          name: section.name,
        },
        upsert: true,
      },
    }))
  )

  return listSectionsForPage(pageId)
}

export async function deleteSection(sectionId: number) {
  const section = await Section.findOne({ id: sectionId }).lean()

  if (!section) {
    throw new Error('Section was not found.')
  }

  await Section.deleteOne({ id: sectionId })

  const remainingSections = await listSectionsForPage(section.page_id)

  if (remainingSections.length > 0) {
    await Section.bulkWrite(
      remainingSections.map((remainingSection, index) => ({
        updateOne: {
          filter: { id: remainingSection.id },
          update: {
            position: index + 1,
          },
        },
      }))
    )
  }

  return listSectionsForPage(section.page_id)
}

export async function reorderSections(pageId: number, orderedSectionIds: number[]) {
  const existingSections = await listSectionsForPage(pageId)

  if (existingSections.length !== orderedSectionIds.length) {
    throw new Error('Section order payload does not match the current page structure.')
  }

  const existingIds = new Set(existingSections.map((section) => section.id))
  const orderedIds = new Set(orderedSectionIds)

  if (existingIds.size !== orderedIds.size) {
    throw new Error('Section order payload contains duplicate ids.')
  }

  for (const sectionId of orderedSectionIds) {
    if (!existingIds.has(sectionId)) {
      throw new Error('Section order payload contains an unknown id.')
    }
  }

  await Section.bulkWrite(
    orderedSectionIds.map((sectionId, index) => ({
      updateOne: {
        filter: { id: sectionId, page_id: pageId },
        update: {
          position: index + 1,
        },
      },
    }))
  )

  return listSectionsForPage(pageId)
}

export async function updateSectionName(sectionId: number, name: string) {
  const section = await Section.findOneAndUpdate(
    { id: sectionId },
    {
      name,
    },
    {
      new: true,
      runValidators: true,
    }
  ).lean()

  if (!section) {
    throw new Error('Section was not found.')
  }

  return listSectionsForPage(section.page_id)
}

import HeadlineModuleContent from '@/models/HeadlineModuleContent'
import Page from '@/models/Page'
import Module from '@/models/Module'
import Section from '@/models/Section'
import TextModuleContent from '@/models/TextModuleContent'

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

function getDefaultModuleName(position: number) {
  return position === 1 ? 'init-module' : 'text-module'
}

function parseBootstrapColumns(value: string | null | undefined) {
  if (!value) {
    return 0
  }

  const match = value.match(/(?:col-md|offset-md)-(\d+)/)
  return match ? Number(match[1]) : 0
}

async function attachModulesToSections<T extends { _id: unknown; position: number }>(
  sections: T[]
) {
  const sectionIds = sections.map((section) => section._id)
  const modules = sectionIds.length
    ? await Module.find({ section_id: { $in: sectionIds } }).sort({ position: 1, _id: 1 }).lean()
    : []
  const headlineContentIds = modules
    .filter((sectionModule) => sectionModule.modulname === 'headline-module' && sectionModule.content_id)
    .map((sectionModule) => sectionModule.content_id)
  const textContentIds = modules
    .filter((sectionModule) => sectionModule.modulname === 'text-module' && sectionModule.content_id)
    .map((sectionModule) => sectionModule.content_id)

  const headlineContents = headlineContentIds.length
    ? await HeadlineModuleContent.find({ _id: { $in: headlineContentIds } }).lean()
    : []
  const textContents = textContentIds.length
    ? await TextModuleContent.find({ _id: { $in: textContentIds } }).lean()
    : []
  const headlineContentsById = new Map(
    headlineContents.map((content) => [
      String(content._id),
      {
        ...content,
        _id: String(content._id),
      },
    ])
  )
  const textContentsById = new Map(
    textContents.map((content) => [
      String(content._id),
      {
        ...content,
        _id: String(content._id),
      },
    ])
  )

  const modulesBySectionId = new Map<string, typeof modules>()

  for (const sectionModule of modules) {
    const sectionId = String(sectionModule.section_id)
    const existingModules = modulesBySectionId.get(sectionId) ?? []
    existingModules.push(sectionModule)
    modulesBySectionId.set(sectionId, existingModules)
  }

  return sections.map((section) => ({
    ...section,
    _id: String(section._id),
    modules: (modulesBySectionId.get(String(section._id)) ?? []).map((sectionModule) => ({
      ...sectionModule,
      _id: String(sectionModule._id),
      section_id: String(sectionModule.section_id),
      bootstrap_width: sectionModule.bootstrap_width ?? 'col-md-12',
      bootstrap_offset: sectionModule.bootstrap_offset ?? '',
      content_id: sectionModule.content_id ? String(sectionModule.content_id) : null,
      content:
        sectionModule.modulname === 'headline-module' && sectionModule.content_id
          ? headlineContentsById.get(String(sectionModule.content_id)) ?? null
          : sectionModule.modulname === 'text-module' && sectionModule.content_id
            ? textContentsById.get(String(sectionModule.content_id)) ?? null
          : null,
    })),
  }))
}

export async function listSectionsForPage(pageId: number) {
  const sections = await Section.find({ page_id: pageId }).sort({ position: 1, id: 1 }).lean()

  return attachModulesToSections(sections)
}

async function ensureModulesForSections(pageId: number) {
  const rawSections = await Section.find({ page_id: pageId }).sort({ position: 1, id: 1 }).lean()

  if (rawSections.length === 0) {
    return []
  }

  const existingModules = await Module.find({
    section_id: { $in: rawSections.map((section) => section._id) },
  })
    .select({ section_id: 1 })
    .lean()

  const sectionIdsWithModules = new Set(
    existingModules.map((sectionModule) => String(sectionModule.section_id))
  )
  const missingSections = rawSections.filter(
    (section) => !sectionIdsWithModules.has(String(section._id))
  )

  if (missingSections.length > 0) {
    await Module.insertMany(
      missingSections.map((section) => ({
        section_id: section._id,
        modulname: getDefaultModuleName(section.position),
        position: 1,
        bootstrap_width: 'col-md-12',
        bootstrap_offset: '',
      }))
    )
  }

  return listSectionsForPage(pageId)
}

export async function ensureDefaultSiteStructure() {
  const page = await Page.findOneAndUpdate({ id: DEFAULT_PAGE.id }, DEFAULT_PAGE, {
    upsert: true,
    returnDocument: 'after',
    runValidators: true,
    setDefaultsOnInsert: true,
  }).lean()

  let sections = await listSectionsForPage(DEFAULT_PAGE.id)

  if (sections.length === 0) {
    const createdSection = await Section.create(DEFAULT_SECTION)

    await Module.create({
      section_id: createdSection._id,
      modulname: 'init-module',
      position: 1,
      bootstrap_width: 'col-md-12',
      bootstrap_offset: '',
    })

    sections = await listSectionsForPage(DEFAULT_PAGE.id)
  }

  sections = await ensureModulesForSections(DEFAULT_PAGE.id)

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

  const createdSection = await Section.create({
    page_id: pageId,
    id: nextSectionId,
    position: existingSections.length + 1,
    name: '',
  })

  nextSections.splice(insertIndex, 0, {
    _id: String(createdSection._id),
    page_id: pageId,
    id: nextSectionId,
    position: insertIndex + 1,
    name: '',
    modules: [],
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

export async function addModuleToSection(sectionId: number, modulname: string) {
  const section = await Section.findOne({ id: sectionId }).lean()

  if (!section) {
    throw new Error('Section was not found.')
  }

  const lastModule = await Module.findOne({ section_id: section._id }).sort({ position: -1, _id: -1 }).lean()
  const nextPosition = (lastModule?.position ?? 0) + 1
  let contentId: string | null = null

  if (modulname === 'headline-module') {
    const headlineContent = await HeadlineModuleContent.create({
      text: 'Headline',
      headline_type: 'h2',
    })
    contentId = String(headlineContent._id)
  } else if (modulname === 'text-module') {
    const textContent = await TextModuleContent.create({
      markup: '<p></p>',
    })
    contentId = String(textContent._id)
  }

  await Module.create({
    section_id: section._id,
    modulname,
    position: nextPosition,
    content_id: contentId,
    bootstrap_width: 'col-md-12',
    bootstrap_offset: '',
  })

  return listSectionsForPage(section.page_id)
}

export async function deleteModule(moduleId: string) {
  const sectionModule = await Module.findById(moduleId).lean()

  if (!sectionModule) {
    throw new Error('Module was not found.')
  }

  const section = await Section.findById(sectionModule.section_id).lean()

  if (!section) {
    throw new Error('Section for module was not found.')
  }

  if (sectionModule.modulname === 'headline-module' && sectionModule.content_id) {
    await HeadlineModuleContent.deleteOne({ _id: sectionModule.content_id })
  }

  if (sectionModule.modulname === 'text-module' && sectionModule.content_id) {
    await TextModuleContent.deleteOne({ _id: sectionModule.content_id })
  }

  await Module.deleteOne({ _id: sectionModule._id })

  const remainingModules = await Module.find({ section_id: sectionModule.section_id })
    .sort({ position: 1, _id: 1 })
    .lean()

  if (remainingModules.length > 0) {
    await Module.bulkWrite(
      remainingModules.map((remainingModule, index) => ({
        updateOne: {
          filter: { _id: remainingModule._id },
          update: {
            position: index + 1,
          },
        },
      }))
    )
  }

  return listSectionsForPage(section.page_id)
}

export async function getHeadlineModuleContent(moduleId: string) {
  const sectionModule = await Module.findById(moduleId).lean()

  if (!sectionModule || sectionModule.modulname !== 'headline-module') {
    throw new Error('Headline module was not found.')
  }

  if (!sectionModule.content_id) {
    const headlineContent = await HeadlineModuleContent.create({
      text: 'Headline',
      headline_type: 'h2',
    })

    await Module.updateOne(
      { _id: sectionModule._id },
      {
        content_id: headlineContent._id,
      }
    )

    return {
      _id: String(headlineContent._id),
      text: headlineContent.text,
      headline_type: headlineContent.headline_type,
    }
  }

  const headlineContent = await HeadlineModuleContent.findById(sectionModule.content_id).lean()

  if (!headlineContent) {
    throw new Error('Headline module content was not found.')
  }

  return {
    _id: String(headlineContent._id),
    text: headlineContent.text,
    headline_type: headlineContent.headline_type,
  }
}

export async function updateHeadlineModuleContent(
  moduleId: string,
  input: { text: string; headline_type: 'h1' | 'h2' | 'h3' }
) {
  const sectionModule = await Module.findById(moduleId).lean()

  if (!sectionModule || sectionModule.modulname !== 'headline-module') {
    throw new Error('Headline module was not found.')
  }

  let contentId = sectionModule.content_id

  if (!contentId) {
    const createdContent = await HeadlineModuleContent.create({
      text: input.text,
      headline_type: input.headline_type,
    })

    contentId = createdContent._id

    await Module.updateOne(
      { _id: sectionModule._id },
      {
        content_id: createdContent._id,
      }
    )
  } else {
    await HeadlineModuleContent.updateOne(
      { _id: contentId },
      {
        text: input.text,
        headline_type: input.headline_type,
      }
    )
  }

  return getHeadlineModuleContent(moduleId)
}

export async function getTextModuleContent(moduleId: string) {
  const sectionModule = await Module.findById(moduleId).lean()

  if (!sectionModule || sectionModule.modulname !== 'text-module') {
    throw new Error('Text module was not found.')
  }

  if (!sectionModule.content_id) {
    const textContent = await TextModuleContent.create({
      markup: '<p></p>',
    })

    await Module.updateOne(
      { _id: sectionModule._id },
      {
        content_id: textContent._id,
      }
    )

    return {
      _id: String(textContent._id),
      markup: textContent.markup,
    }
  }

  const textContent = await TextModuleContent.findById(sectionModule.content_id).lean()

  if (!textContent) {
    throw new Error('Text module content was not found.')
  }

  return {
    _id: String(textContent._id),
    markup: textContent.markup,
  }
}

export async function updateTextModuleContent(
  moduleId: string,
  input: { markup: string }
) {
  const sectionModule = await Module.findById(moduleId).lean()

  if (!sectionModule || sectionModule.modulname !== 'text-module') {
    throw new Error('Text module was not found.')
  }

  const nextMarkup = input.markup || '<p></p>'
  let contentId = sectionModule.content_id

  if (!contentId) {
    const createdContent = await TextModuleContent.create({
      markup: nextMarkup,
    })

    contentId = createdContent._id

    await Module.updateOne(
      { _id: sectionModule._id },
      {
        content_id: createdContent._id,
      }
    )
  } else {
    await TextModuleContent.updateOne(
      { _id: contentId },
      {
        markup: nextMarkup,
      }
    )
  }

  return getTextModuleContent(moduleId)
}

export async function updateModuleLayout(
  moduleId: string,
  input: {
    bootstrap_width: 'col-md-12' | 'col-md-8' | 'col-md-6' | 'col-md-4' | 'col-md-3'
    bootstrap_offset: '' | 'offset-md-1' | 'offset-md-2'
  }
) {
  const totalColumns =
    parseBootstrapColumns(input.bootstrap_width) + parseBootstrapColumns(input.bootstrap_offset)

  if (totalColumns > 12) {
    throw new Error('Bootstrap-Breite und Einrueckung duerfen zusammen nicht groesser als 12 sein.')
  }

  const sectionModule = await Module.findByIdAndUpdate(
    moduleId,
    {
      bootstrap_width: input.bootstrap_width,
      bootstrap_offset: input.bootstrap_offset,
    },
    {
      new: true,
      runValidators: true,
    }
  ).lean()

  if (!sectionModule) {
    throw new Error('Module was not found.')
  }

  return {
    _id: String(sectionModule._id),
    bootstrap_width: sectionModule.bootstrap_width ?? 'col-md-12',
    bootstrap_offset: sectionModule.bootstrap_offset ?? '',
  }
}

export async function reorderModulesForSection(sectionId: number, orderedModuleIds: string[]) {
  const section = await Section.findOne({ id: sectionId }).lean()

  if (!section) {
    throw new Error('Section was not found.')
  }

  const existingModules = await Module.find({ section_id: section._id })
    .sort({ position: 1, _id: 1 })
    .lean()

  if (existingModules.length !== orderedModuleIds.length) {
    throw new Error('Module order payload does not match the current section structure.')
  }

  const existingIds = new Set(existingModules.map((module) => String(module._id)))
  const orderedIds = new Set(orderedModuleIds)

  if (existingIds.size !== orderedIds.size) {
    throw new Error('Module order payload contains duplicate ids.')
  }

  for (const moduleId of orderedModuleIds) {
    if (!existingIds.has(moduleId)) {
      throw new Error('Module order payload contains an unknown id.')
    }
  }

  const temporaryOffset = orderedModuleIds.length + 1000

  await Module.bulkWrite(
    orderedModuleIds.map((moduleId, index) => ({
      updateOne: {
        filter: { _id: moduleId, section_id: section._id },
        update: {
          position: temporaryOffset + index,
        },
      },
    }))
  )

  await Module.bulkWrite(
    orderedModuleIds.map((moduleId, index) => ({
      updateOne: {
        filter: { _id: moduleId, section_id: section._id },
        update: {
          position: index + 1,
        },
      },
    }))
  )

  return listSectionsForPage(section.page_id)
}

export async function deleteSection(sectionId: number) {
  const section = await Section.findOne({ id: sectionId }).lean()

  if (!section) {
    throw new Error('Section was not found.')
  }

  await Section.deleteOne({ id: sectionId })
  await Module.deleteMany({ section_id: section._id })

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
      returnDocument: 'after',
      runValidators: true,
    }
  ).lean()

  if (!section) {
    throw new Error('Section was not found.')
  }

  return listSectionsForPage(section.page_id)
}

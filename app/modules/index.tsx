import type { ReactNode } from 'react'
import type { SectionItem, SectionModuleItem } from '../global'
import { HeadlineModule } from './headline-module'
import { ImageModule } from './image-module'
import { TextModule } from './text-module'

export type AvailableModuleItem = {
  key: string
  name: string
}

type ModuleRenderer = {
  key: string
  name: string
  render: (section: SectionItem, moduleId: string) => ReactNode
}

function getModuleGridClassName(module: SectionModuleItem | undefined) {
  return `${module?.bootstrap_width ?? 'col-md-12'} ${module?.bootstrap_offset ?? ''}`.trim()
}

const MODULE_REGISTRY: ModuleRenderer[] = [
  {
    key: 'headline-module',
    name: 'Headline Modul',
    render: (section, moduleId) => {
      const sectionModule = section.modules.find((entry) => entry._id === moduleId)
      const content =
        sectionModule?.content && 'text' in sectionModule.content ? sectionModule.content : null

      return (
        <HeadlineModule
          key={moduleId}
          className={getModuleGridClassName(sectionModule)}
          text={content?.text ?? 'Headline'}
          headlineType={content?.headline_type ?? 'h2'}
        />
      )
    },
  },
  {
    key: 'image-module',
    name: 'Image Modul',
    render: (section, moduleId) => {
      const sectionModule = section.modules.find((entry) => entry._id === moduleId)
      const content =
        sectionModule?.content && 'src' in sectionModule.content ? sectionModule.content : null

      return (
        <ImageModule
          key={moduleId}
          className={getModuleGridClassName(sectionModule)}
          src={content?.src ?? '/assets/admin/noimg.jpg'}
          alt={content?.alt ?? 'Kein Bild ausgewaehlt'}
        />
      )
    },
  },
  {
    key: 'text-module',
    name: 'Text Modul',
    render: (section, moduleId) => {
      const sectionModule = section.modules.find((entry) => entry._id === moduleId)
      const content =
        sectionModule?.content && 'markup' in sectionModule.content ? sectionModule.content : null

      return (
        <TextModule
          key={moduleId}
          className={getModuleGridClassName(sectionModule)}
          markup={content?.markup ?? '<p></p>'}
        />
      )
    },
  },
]

const MODULE_LOOKUP = new Map(MODULE_REGISTRY.map((registryModule) => [registryModule.key, registryModule]))

export const AVAILABLE_MODULES: AvailableModuleItem[] = MODULE_REGISTRY.map(({ key, name }) => ({
  key,
  name,
})).sort((left, right) => left.name.localeCompare(right.name, 'de'))

export function renderSectionModule(section: SectionItem, module: SectionModuleItem) {
  const moduleDefinition = MODULE_LOOKUP.get(module.modulname)

  if (!moduleDefinition) {
    return null
  }

  return moduleDefinition.render(section, module._id)
}

export function renderSectionModules(section: SectionItem) {
  return section.modules.map((module) => renderSectionModule(section, module))
}

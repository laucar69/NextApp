export type HeadlineModuleContentItem = {
  _id: string
  text: string
  headline_type: 'h1' | 'h2' | 'h3'
}

export type TextModuleContentItem = {
  _id: string
  markup: string
}

export type ImageModuleContentItem = {
  _id: string
  src: string
  alt: string
}

export type SectionModuleItem = {
  _id: string
  section_id: string
  modulname: string
  position: number
  bootstrap_width?: 'col-md-12' | 'col-md-8' | 'col-md-6' | 'col-md-4' | 'col-md-3'
  bootstrap_offset?: '' | 'offset-md-1' | 'offset-md-2'
  content_id?: string | null
  content?: HeadlineModuleContentItem | TextModuleContentItem | ImageModuleContentItem | null
}

export type SectionItem = {
  _id: string
  id: number
  page_id: number
  position: number
  name: string
  modules: SectionModuleItem[]
}

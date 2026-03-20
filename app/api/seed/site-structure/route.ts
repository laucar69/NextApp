import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongodb'
import { ensureDefaultSiteStructure } from '@/lib/site-structure'

export async function POST() {
  try {
    await dbConnect()
    const { page, sections } = await ensureDefaultSiteStructure()
    const section = sections[0] ?? null

    return NextResponse.json({
      ok: true,
      message: 'Initial page and section seeded successfully.',
      page: {
        id: page?.id,
        name: page?.name,
        title: page?.title,
      },
      section: {
        _id: section?._id,
        id: section?.id,
        page_id: section?.page_id,
        position: section?.position,
        name: section?.name,
        modules: section?.modules ?? [],
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown seed error',
      },
      { status: 500 }
    )
  }
}

import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { LOCALES } from '@/config/site'

/**
 *   /api/revalidate?secret=…&path=/en/insights   — one path
 *   /api/revalidate?secret=…                     — every locale + section
 *
 * Trigger manually, or from a Notion automation on publish.
 */
const SECTIONS = ['', '/projects', '/insights'] as const

function handle(req: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET
  if (!expected) return NextResponse.json({ error: 'not_configured' }, { status: 500 })
  if (req.nextUrl.searchParams.get('secret') !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const path = req.nextUrl.searchParams.get('path')
  const revalidated: string[] = []

  if (path) {
    revalidatePath(path)
    revalidated.push(path)
  } else {
    for (const l of LOCALES) {
      for (const s of SECTIONS) {
        revalidatePath(`/${l}${s}`)
        revalidated.push(`/${l}${s}`)
      }
    }
  }

  return NextResponse.json({ revalidated, at: new Date().toISOString() })
}

export const GET = handle
export const POST = handle

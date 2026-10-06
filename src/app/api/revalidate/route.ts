import { timingSafeEqual } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { LOCALES } from '@/config/site'
import { clientIp, secretFailed, secretLocked } from '@/lib/rate-limit'

/**
 *   /api/revalidate?secret=…&path=/en/insights   — one path
 *   /api/revalidate?secret=…                     — the whole site, every locale
 *
 * The site already refreshes from Notion on its own within about a
 * minute; this is for "show it now". Bookmark it, or call it from a Notion
 * button or automation.
 */
async function handle(req: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET
  if (!expected) return NextResponse.json({ error: 'not_configured' }, { status: 500 })
  const ip = clientIp(req.headers)
  if (secretLocked(ip)) return NextResponse.json({ error: 'too_many_attempts' }, { status: 429, headers: { 'Retry-After': '3600' } })
  const given = Buffer.from(req.nextUrl.searchParams.get('secret') ?? '')
  const want = Buffer.from(expected)
  if (given.length !== want.length || !timingSafeEqual(given, want)) {
    secretFailed(ip)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const path = req.nextUrl.searchParams.get('path')
  const revalidated: string[] = []

  // Refreshing throws the current pages away. If Notion is not answering, or
  // cannot find the Insights database right now, the rebuilt pages would fail
  // or fall back to the samples, so check first and keep the current site.
  if (process.env.NOTION_TOKEN && process.env.INSIGHTS_SOURCE !== 'local') {
    const { forgetRows, findInsightsDataSource } = await import('@/content/notion/insights')
    const { notion } = await import('@/content/notion/client')
    try {
      const ds = await findInsightsDataSource()
      await notion.dataSources.query({ data_source_id: ds, page_size: 1 })
    } catch (e: any) {
      const setup = e?.name === 'NotSetUp'
      console.error('[revalidate] nothing refreshed:', setup ? 'no Insights database found' : e?.code ?? e?.message)
      return NextResponse.json({
        error: setup ? 'insights_not_found' : 'notion_unavailable',
        detail: setup
          ? 'The Insights database could not be found in Notion just now, so nothing was refreshed. If setup has not been run yet, open /api/notion/setup first.'
          : 'Notion is not responding right now. Nothing was refreshed, so the site keeps showing the current version. Try again in a few minutes.',
      }, { status: setup ? 409 : 503 })
    }
    forgetRows()
  }

  if (path) {
    revalidatePath(path)
    revalidated.push(path)
  } else {
    revalidatePath('/', 'layout')
    revalidated.push(...LOCALES.map(l => `/${l}/*`))
  }

  return NextResponse.json({ revalidated, at: new Date().toISOString() })
}

export const GET = handle
export const POST = handle

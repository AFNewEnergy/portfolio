import type { NextRequest } from 'next/server'
import { rateLimit, clientIp } from '@/lib/rate-limit'

/**
 * /api/notion/file/<block id>/<version>
 *
 * PDFs, videos and other files uploaded into Notion. Their links expire after
 * about an hour, so this route looks up a fresh one and redirects to it. The
 * redirect is cached at the edge for 30 minutes, well inside the link's life.
 * <version> is the block's last-edited minute; any other value is sent to the
 * current address, and the lookup is remembered (lookup.ts), so varying the
 * address does not cost a Notion API call per request.
 */
export const runtime = 'nodejs'

const TYPES = ['file', 'pdf', 'video', 'audio', 'image'] as const

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; v: string }> }) {
  const { id, v } = await params
  const miss = () => new Response(null, { status: 404, headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' } })
  if (!process.env.NOTION_TOKEN || !/^[0-9a-f]{32}$/.test(id) || !/^\d{1,12}$/.test(v) || req.nextUrl.search) return miss()
  if (!rateLimit(`file:${clientIp(req.headers)}`, 60, 60_000).ok) return new Response(null, { status: 429, headers: { 'Retry-After': '60' } })

  const { lookupFile } = await import('@/content/notion/lookup')
  const { stamp } = await import('@/content/notion/media')
  try {
    let found = await lookupFile('block', id)
    if (found.url && stamp(found.edited) !== v) found = await lookupFile('block', id, true)
    if (!found.type || !(TYPES as readonly string[]).includes(found.type)) return miss()
    if (!found.url || !/^https?:\/\//.test(found.url)) return miss()
    const current = stamp(found.edited)
    if (current !== v) {
      return new Response(null, { status: 302, headers: { Location: `/api/notion/file/${id}/${current}`, 'Cache-Control': 'public, max-age=60, s-maxage=60' } })
    }
    return new Response(null, { status: 302, headers: { Location: found.url, 'Cache-Control': 'public, max-age=0, s-maxage=1800' } })
  } catch {
    return new Response(null, { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '30' } })
  }
}

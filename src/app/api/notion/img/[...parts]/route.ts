import type { NextRequest } from 'next/server'
import { RELAY, RELAY_WIDTHS } from '@/lib/img'
import { rateLimit, clientIp } from '@/lib/rate-limit'

/**
 * /api/notion/img/<cover|block>/<id>/<version>/<width>[/jpg]
 *
 * Photos uploaded into Notion come with links that expire after about an
 * hour. This route asks Notion for a fresh link, downloads the photo, resizes
 * it to the requested width as WebP (or JPEG with /jpg, for link previews) and
 * returns it with a one-year cache.
 *
 * <version> is a fingerprint of the stored file (see media.ts). Only the
 * current version is served and cached; any other one is redirected to the
 * current address. The lookup is remembered (lookup.ts), so varying the
 * address cannot turn into one Notion API call per request.
 *
 * Only files stored in Notion are fetched: links pasted into Notion are shown
 * by the page directly and never pass through here.
 *
 * Resizing here, not in Next's optimiser, keeps phone photos of any size under
 * Vercel's 4.5 MB response limit and off the image-optimisation quota.
 */
export const runtime = 'nodejs'
export const maxDuration = 30

const MAX_BYTES = 40 * 1024 * 1024
const MAX_OUT = 4 * 1024 * 1024
const IMMUTABLE = 'public, max-age=31536000, s-maxage=31536000, immutable'

const gone = () => new Response(null, { status: 404, headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' } })
const busy = () => new Response(null, { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '30' } })

export async function GET(req: NextRequest, { params }: { params: Promise<{ parts: string[] }> }) {
  const parts = (await params).parts ?? []
  const [kind = '', id = '', version = '', wRaw = '', fmt] = parts
  const width = Number(wRaw)
  const jpg = fmt === 'jpg'
  if (!process.env.NOTION_TOKEN) return gone()
  if (parts.length > 5 || (fmt !== undefined && !jpg) || req.nextUrl.search) return gone()
  if ((kind !== 'cover' && kind !== 'block') || !/^[0-9a-f]{32}$/.test(id) || !/^[0-9a-f]{1,32}$/.test(version)) return gone()
  if (!(RELAY_WIDTHS as readonly number[]).includes(width)) return gone()
  if (!rateLimit(`img:${clientIp(req.headers)}`, 120, 60_000).ok) return busy()

  const { lookupFile } = await import('@/content/notion/lookup')
  const { fileVersion } = await import('@/content/notion/media')

  let url: string | null = null
  let current = ''
  try {
    let found = await lookupFile(kind, id)
    // A version we do not know yet may be a photo replaced a moment ago: ask Notion again (at most once a minute).
    if (found.url && fileVersion(found.url) !== version) found = await lookupFile(kind, id, true)
    if (kind === 'block' && found.type !== 'image') return gone()
    url = found.url
    current = fileVersion(url)
  } catch (e: any) {
    console.warn('[notion-img] lookup failed', kind, id, e?.code || e?.message)
    return busy()
  }
  if (!url || !/^https?:\/\//.test(url)) return gone()

  if (current !== version) {
    return new Response(null, {
      status: 302,
      headers: { Location: `${RELAY}${kind}/${id}/${current}/${width}${jpg ? '/jpg' : ''}`, 'Cache-Control': 'public, max-age=60, s-maxage=60' },
    })
  }

  let bytes: Buffer
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) })
    if (!res.ok) return busy()
    if (Number(res.headers.get('content-length') ?? 0) > MAX_BYTES) {
      return new Response(null, { status: 302, headers: { Location: url, 'Cache-Control': 'no-store' } })
    }
    bytes = Buffer.from(await res.arrayBuffer())
  } catch {
    return busy()
  }

  try {
    const sharp = (await import('sharp')).default
    const encode = async (animated: boolean, quality: number) => {
      const img = sharp(bytes, { animated, limitInputPixels: 268_402_689 }).rotate().resize({ width, withoutEnlargement: true })
      return jpg
        ? img.flatten({ background: '#ffffff' }).jpeg({ quality, mozjpeg: true }).toBuffer()
        : img.webp({ quality }).toBuffer()
    }
    let out = await encode(!jpg, 80)
    // A long animated GIF can come out larger than a function may return: keep the first frame.
    if (out.length > MAX_OUT) out = await encode(false, 72)
    return new Response(new Uint8Array(out), {
      headers: {
        'Content-Type': jpg ? 'image/jpeg' : 'image/webp',
        'Cache-Control': IMMUTABLE,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    // A format the resizer cannot read (e.g. HEIC): hand the browser the fresh original.
    return new Response(null, { status: 302, headers: { Location: url, 'Cache-Control': 'no-store' } })
  }
}

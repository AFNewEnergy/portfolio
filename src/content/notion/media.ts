import { createHash } from 'node:crypto'
import { site } from '@/config/site'
import { RELAY } from '@/lib/img'
import { bareId } from '@/lib/slug'

/**
 * Where an image in Notion should be loaded from.
 *
 * Photos uploaded into Notion come back as signed links that stop working
 * after about an hour, so they go through /api/notion/img, which asks Notion
 * for a fresh link and caches the resized result. The relay address carries a
 * short fingerprint of the file itself (its storage path, without the
 * signature), so replacing a photo gives it a new address even within the
 * same minute, and nobody sees the old one.
 *
 * Links pasted into Notion ("Embed link") are permanent and used directly —
 * except links back to this site's own /photos, which are turned into local
 * paths so Next can resize them.
 */
const OWN_HOSTS = new Set(
  [site.url, process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_BRANCH_URL]
    .filter((h): h is string => Boolean(h))
    .map(h => {
      try { return new URL(/^https?:\/\//.test(h) ? h : `https://${h}`).host } catch { return '' }
    })
    .filter(Boolean),
)

/** 2026-09-20T10:31:00.000Z → 202609201031 */
export const stamp = (iso?: string | null) => (iso ? iso.replace(/\D/g, '').slice(0, 12) : '0')

/** Fingerprint of a Notion file: the same across re-signed links, different for a new upload. */
export const fileVersion = (url?: string | null) =>
  url ? createHash('sha1').update(url.split('?')[0]!).digest('hex').slice(0, 12) : '0'

type FileLike = { type?: string; external?: { url?: string }; file?: { url?: string } } | null | undefined

export function mediaSrc(file: FileLike, owner: { kind: 'block' | 'cover'; id: string; edited?: string | null }): string | null {
  if (!file) return null
  if (file.type === 'external') {
    const url = file.external?.url
    if (!url) return null
    if (url.startsWith('/') && !url.startsWith('//')) return url
    try {
      const u = new URL(url)
      if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
      if (OWN_HOSTS.has(u.host) && u.pathname.startsWith('/photos/')) return u.pathname
    } catch {
      return null
    }
    return url
  }
  if (file.type === 'file' || file.type === 'file_upload') {
    const version = file.file?.url ? fileVersion(file.file.url) : stamp(owner.edited)
    return `${RELAY}${owner.kind}/${bareId(owner.id)}/${version}`
  }
  return null
}

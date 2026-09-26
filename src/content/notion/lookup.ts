import { notionQuick } from './client'

/**
 * A fresh link for a file stored in Notion, remembered for a while.
 *
 * Notion's signed links last about an hour, so one lookup can serve every
 * request for the same photo for 20 minutes. That keeps the relays from
 * spending a Notion API call on each request, however the address is varied.
 * "Not found" is remembered too; other errors are not, so they are retried.
 */
export type Found = { url: string | null; edited: string | null; type: string | null }

const TTL = 20 * 60_000
const REFRESH_AFTER = 60_000
const MAX = 2000
const memo = new Map<string, { at: number; p: Promise<Found> }>()
const MISSING = new Set(['object_not_found', 'validation_error', 'restricted_resource'])

async function fetchFound(kind: 'cover' | 'block', id: string): Promise<Found> {
  try {
    if (kind === 'cover') {
      const page: any = await notionQuick.pages.retrieve({ page_id: id })
      return { url: page.cover?.type === 'file' ? page.cover.file?.url ?? null : null, edited: page.last_edited_time ?? null, type: 'cover' }
    }
    const block: any = await notionQuick.blocks.retrieve({ block_id: id })
    const v = block[block.type]
    // Only files stored in Notion. Links pasted into Notion are used directly by the page, never fetched here.
    return { url: v?.type === 'file' ? v.file?.url ?? null : null, edited: block.last_edited_time ?? null, type: block.type ?? null }
  } catch (e: any) {
    if (MISSING.has(e?.code)) return { url: null, edited: null, type: null }
    throw e
  }
}

/** `fresh` asks Notion again when the remembered answer is over a minute old (used when a newer file is expected). */
export function lookupFile(kind: 'cover' | 'block', id: string, fresh = false): Promise<Found> {
  const key = `${kind}:${id}`
  const hit = memo.get(key)
  const age = hit ? Date.now() - hit.at : Infinity
  if (hit && age < TTL && !(fresh && age > REFRESH_AFTER)) return hit.p
  const p = fetchFound(kind, id)
  memo.set(key, { at: Date.now(), p })
  p.catch(() => { if (memo.get(key)?.p === p) memo.delete(key) })
  if (memo.size > MAX) memo.delete(memo.keys().next().value!)
  return p
}

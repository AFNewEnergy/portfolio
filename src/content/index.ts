import type { ContentSource } from './types'
import { localSource } from './local'

/**
 * Adapter selector.
 *
 * CONTENT_SOURCE=local  (default) — typed files in src/content/local.
 * CONTENT_SOURCE=notion           — the Notion adapter, loaded lazily so the
 *                                   SDK is never bundled unless it is used.
 *
 * Switching is one env var. No page or component changes.
 */
async function resolve(): Promise<ContentSource> {
  if (process.env.CONTENT_SOURCE === 'notion') {
    if (!process.env.NOTION_TOKEN) {
      console.warn('[content] CONTENT_SOURCE=notion but NOTION_TOKEN is missing — falling back to local.')
      return localSource
    }
    const { notionSource } = await import('./notion')
    return notionSource
  }
  return localSource
}

let cached: Promise<ContentSource> | null = null
export const content = (): Promise<ContentSource> => (cached ??= resolve())

export * from './types'

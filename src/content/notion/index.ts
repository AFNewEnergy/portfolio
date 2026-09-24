import { DEFAULT_LOCALE, type Locale } from '@/config/site'
import type { ContentSource, Project, Insight } from '../types'
import { coerceTechnology, coerceStage } from '../types'
import { notion, INSIGHTS_DS, PROJECTS_DS } from './client'
import { pTitle, pText, pSelect, pMulti, pNumber, pCheck, pUrl, pDate } from './props'
import { renderBlocks, plain } from './render'
import { readingTime } from '@/lib/format'

/* ── block fetching ───────────────────────────────────────── */

async function getBlocks(blockId: string, depth = 0): Promise<any[]> {
  if (depth > 3) return []           // guard against pathological nesting
  const out: any[] = []
  let cursor: string | undefined

  do {
    const res = await notion.blocks.children.list({ block_id: blockId, start_cursor: cursor, page_size: 100 })
    for (const b of res.results as any[]) {
      if (b.has_children && b.type !== 'child_page') b.children = await getBlocks(b.id, depth + 1)
      out.push(b)
    }
    cursor = res.has_more ? (res.next_cursor as string) : undefined
  } while (cursor)

  return out
}

async function bodyOf(pageId: string): Promise<string> {
  try {
    return renderBlocks(await getBlocks(pageId))
  } catch (e) {
    console.error('[notion] failed to read blocks for', pageId, e)
    return ''
  }
}

/* ── mappers ──────────────────────────────────────────────── */

function toProject(page: any, body: string): Project {
  const p = page.properties
  const confidential = pCheck(p, 'Confidential')
  const title = pTitle(p, 'Title')

  // Drop unrecognised Technology options rather than letting them reach a
  // translation lookup that has no matching key.
  const technology = pMulti(p, 'Technology').flatMap(raw => {
    const match = coerceTechnology(raw)
    if (!match) console.warn(`[notion] "${title}": unknown Technology "${raw}" — ignored. Allowed: see TECHNOLOGIES in src/content/types.ts`)
    return match ? [match] : []
  })

  const rawStage = pSelect(p, 'Stage')
  const stage = coerceStage(rawStage)
  if (rawStage && stage !== rawStage) {
    console.warn(`[notion] "${title}": Stage "${rawStage}" not recognised — using "${stage}"`)
  }
  const summary = pText(p, 'Summary')
  if (!summary && !body) {
    console.warn(`[notion] "${title}": no Summary — the register and cards will show a blank line. The page body is only used as a fallback on the detail page.`)
  }

  return {
    slug: pText(p, 'Slug'),
    title,
    summary: summary || plain(body).slice(0, 180),
    capacityMW: pNumber(p, 'Capacity MW'),
    technology,
    stage,
    client: confidential ? null : pText(p, 'Client') || null,
    confidential,
    location: pText(p, 'Location') || null,
    role: pText(p, 'Role') || null,
    year: pNumber(p, 'Year'),
    metrics: ['Metric 1', 'Metric 2', 'Metric 3'].map(k => pText(p, k)).filter(Boolean),
    cover: pUrl(p, 'Cover URL'),
    featured: pCheck(p, 'Featured'),
    order: pNumber(p, 'Order') ?? 999,
    body,
  }
}

function toInsight(page: any, body: string): Insight {
  const p = page.properties
  return {
    slug: pText(p, 'Slug'),
    title: pTitle(p, 'Title'),
    excerpt: pText(p, 'Excerpt'),
    type: pSelect(p, 'Type') === 'Video' ? 'Video' : 'Article',
    videoUrl: pUrl(p, 'Video URL'),
    cover: pUrl(p, 'Cover URL'),
    tags: pMulti(p, 'Tags'),
    date: pDate(p, 'Date'),
    /**
     * Index queries carry no body, and readingTime('') is 1 — so without the
     * `Reading Minutes` property every card on the homepage and the insights
     * index reads "1 min read" regardless of length. Fill the number in Notion;
     * the computed value is only a fallback for the detail page.
     */
    readingMinutes: pNumber(p, 'Reading Minutes') ?? readingTime(plain(body)),
    body,
  }
}

/* ── queries ──────────────────────────────────────────────── */

const filterFor = (locale: Locale, extra: any[] = []) => ({
  and: [
    { property: 'Published', checkbox: { equals: true } },
    { property: 'Language', select: { equals: locale } },
    ...extra,
  ],
})

/**
 * Runs a data source query to completion.
 *
 * Notion caps a page of results at 100 and hands back a cursor. Reading only
 * the first page silently truncates the register the moment the 101st row is
 * added — the kind of failure nobody notices because nothing errors. `limit`
 * stops early when the caller only wants the first few rows.
 */
async function query(dataSourceId: string, filter: any, sorts: any[], limit?: number) {
  if (!dataSourceId) throw new Error('[notion] missing data source id — check NOTION_*_DS env vars')

  const out: any[] = []
  let cursor: string | undefined

  do {
    const remaining = limit ? limit - out.length : 100
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter,
      sorts,
      start_cursor: cursor,
      page_size: Math.min(100, Math.max(1, remaining)),
    })
    out.push(...(res.results as any[]))
    if (limit && out.length >= limit) return out.slice(0, limit)
    cursor = res.has_more ? (res.next_cursor as string) : undefined
  } while (cursor)

  return out
}

/**
 * Rows for `locale`, falling back to the default locale when nothing has been
 * translated yet.
 *
 * Content is authored once in English. Without this fallback a strict
 * `Language = zh` filter returns nothing, so five of the six locales lose every
 * project and article the moment CONTENT_SOURCE=notion is set, and the detail
 * pages 404. Faisal can add a translated row later and it takes precedence
 * automatically — no code change, no redeploy.
 */
async function localised(
  dataSourceId: string, locale: Locale, extra: any[], sorts: any[], limit?: number,
) {
  const rows = await query(dataSourceId, filterFor(locale, extra), sorts, limit)
  if (rows.length || locale === DEFAULT_LOCALE) return rows
  return query(dataSourceId, filterFor(DEFAULT_LOCALE, extra), sorts, limit)
}

export const notionSource: ContentSource = {
  async getProjects(locale, opts) {
    const extra = opts?.featuredOnly ? [{ property: 'Featured', checkbox: { equals: true } }] : []
    const rows = await localised(
      PROJECTS_DS,
      locale,
      extra,
      [{ property: 'Order', direction: 'ascending' }],
      opts?.limit,
    )
    // Index rows carry no block body — that would be one API call per row.
    // `Summary` therefore has to be filled in; the body fallback in toProject
    // only applies on the detail page, where the body is loaded.
    return rows.map(r => toProject(r, ''))
  },

  async getProject(locale, slug) {
    const rows = await localised(
      PROJECTS_DS, locale, [{ property: 'Slug', rich_text: { equals: slug } }], [], 1,
    )
    const page = rows[0]
    return page ? toProject(page, await bodyOf(page.id)) : null
  },

  async getInsights(locale, opts) {
    const rows = await localised(
      INSIGHTS_DS,
      locale,
      [],
      [{ property: 'Date', direction: 'descending' }],
      opts?.limit,
    )
    return rows.map(r => toInsight(r, ''))
  },

  async getInsight(locale, slug) {
    const rows = await localised(
      INSIGHTS_DS, locale, [{ property: 'Slug', rich_text: { equals: slug } }], [], 1,
    )
    const page = rows[0]
    return page ? toInsight(page, await bodyOf(page.id)) : null
  },
}

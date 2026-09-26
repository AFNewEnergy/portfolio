import { unstable_cache } from 'next/cache'
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/config/site'
import { slugify, bareId } from '@/lib/slug'
import type { Insight } from '../types'
import { splitCredit, readingMinutes } from '../shared'
import { notion, INSIGHTS_DS } from './client'
import { P, INSIGHTS_DB_TITLE } from './schema'
import { pText, pSelect, pMulti, pNumber, pUrl, pDate } from './props'
import { renderArticle, plainOf, type Rendered } from './render'
import { mediaSrc } from './media'

/* ── finding the database ─────────────────────────────────────────────
   Nobody has to copy an id anywhere: the site looks for a data source called
   "Insights" (or one with the Published and Subtitle columns, in case it was
   renamed). If search has not indexed a brand-new database yet, it looks
   inside the pages the connection can see for an Insights database block.  */

export class NotSetUp extends Error {
  constructor() { super('No Insights database is visible to the Notion connection yet.'); this.name = 'NotSetUp' }
}

const titleText = (x: any) => plainOf(x?.title ?? []).trim()
const looksLikeInsights = (ds: any) =>
  titleText(ds).toLowerCase() === INSIGHTS_DB_TITLE.toLowerCase() ||
  Boolean(ds?.properties?.[P.published] && ds?.properties?.[P.subtitle])

export async function findInsightsDataSource(): Promise<string> {
  if (INSIGHTS_DS) return INSIGHTS_DS

  const found = await notion.search({ filter: { property: 'object', value: 'data_source' }, page_size: 100 })
  const sources = (found.results as any[]).filter(r => r.object === 'data_source' && !r.in_trash)
  const hit = sources.find(ds => titleText(ds).toLowerCase() === INSIGHTS_DB_TITLE.toLowerCase()) ?? sources.find(looksLikeInsights)
  if (hit) return hit.id

  const pages = await notion.search({ filter: { property: 'object', value: 'page' }, page_size: 50 })
  const ordered = (pages.results as any[])
    .filter(p => p.object === 'page' && !p.in_trash)
    .sort((a, b) => Number(pageTitle(b) === 'Website') - Number(pageTitle(a) === 'Website'))
  for (const page of ordered.slice(0, 8)) {
    const kids = await notion.blocks.children.list({ block_id: page.id, page_size: 100 })
    for (const k of kids.results as any[]) {
      if (k.type !== 'child_database') continue
      if ((k.child_database?.title ?? '').trim().toLowerCase() !== INSIGHTS_DB_TITLE.toLowerCase()) continue
      const db: any = await notion.databases.retrieve({ database_id: k.id })
      if (db.data_sources?.[0]?.id) return db.data_sources[0].id
    }
  }
  throw new NotSetUp()
}

export const pageTitle = (page: any) => {
  const t = Object.values(page?.properties ?? {}).find((x: any) => x?.type === 'title') as any
  return plainOf(t?.title ?? []).trim()
}

/**
 * Found once, then remembered: search results in Notion are not guaranteed to
 * be complete on every call. The cache is emptied by the setup route and also
 * by any page refresh (Next clears a page's cached data when the page is
 * revalidated), so the last id this server found is kept as well and used if
 * a later search misses. "Not set up yet" is an error, so it is never cached.
 * Setting NOTION_INSIGHTS_DS in Vercel skips the search altogether.
 */
const cachedDataSourceId = unstable_cache(findInsightsDataSource, ['notion-insights-ds-v2'], {
  revalidate: false, tags: ['notion-insights-ds'],
})
let lastDataSource: string | null = null

async function dataSourceId(): Promise<string> {
  try {
    lastDataSource = await cachedDataSourceId()
    return lastDataSource
  } catch (e: any) {
    if (e?.name === 'NotSetUp' && lastDataSource) return lastDataSource
    throw e
  }
}

/** For the setup route, after it creates the database. */
export function forgetDataSource() {
  lastDataSource = null
}

/* ── rows ─────────────────────────────────────────────────── */

type Row = { page: any; lang: string; slug: string; date: string }

async function queryPublished(ds: string): Promise<any[]> {
  const out: any[] = []
  let cursor: string | undefined
  do {
    const res = await notion.dataSources.query({
      data_source_id: ds,
      filter: { property: P.published, checkbox: { equals: true } },
      start_cursor: cursor,
      page_size: 100,
    })
    out.push(...(res.results as any[]).filter(r => r.object === 'page' && !r.in_trash && !r.is_archived))
    cursor = res.has_more ? (res.next_cursor as string) : undefined
  } while (cursor)
  return out
}

/**
 * The web address of an article. Uses Slug when filled in; otherwise the
 * headline plus the last six characters of the page id (the random part —
 * newer Notion ids start with a timestamp), so the address still resolves,
 * and redirects to the new one, if the headline is edited later.
 */
const idTail = (id: string) => bareId(id).slice(-6)
const explicitSlug = (page: any) => slugify(pText(page.properties, P.slug))

function slugOf(page: any): string {
  const explicit = explicitSlug(page)
  if (explicit) return explicit
  const base = slugify(pageTitle(page)) || 'insight'
  return `${base}-${idTail(page.id)}`
}

/** A Language outside the six locales (say "English" or "bn") counts as English rather than hiding the article. */
function langOf(page: any): string {
  const raw = pSelect(page.properties, P.language).trim().toLowerCase()
  if (!raw) return DEFAULT_LOCALE
  if ((LOCALES as readonly string[]).includes(raw)) return raw
  console.warn(`[notion] "${pageTitle(page)}": Language "${raw}" is not one of ${LOCALES.join(', ')} — treated as ${DEFAULT_LOCALE}.`)
  return DEFAULT_LOCALE
}

function toRow(page: any): Row {
  return {
    page,
    lang: langOf(page),
    slug: slugOf(page),
    date: pDate(page.properties, P.date)?.slice(0, 10) ?? String(page.created_time).slice(0, 10),
  }
}

/* Every page render asks for the list; a short in-process memo keeps a build
   (six locales × several pages) to one query instead of dozens. */
let memo: { at: number; rows: Promise<Row[]> } | null = null
async function allRows(): Promise<Row[]> {
  if (memo && Date.now() - memo.at < 20_000) return memo.rows
  const rows = (async () => (await queryPublished(await dataSourceId())).map(toRow))()
  memo = { at: Date.now(), rows }
  // "Not set up yet" is remembered for the same 20 s; real errors are retried at once.
  rows.catch(e => { if (e?.name !== 'NotSetUp') memo = null })
  return rows
}

/** Called by the setup route so the new database shows up immediately. */
export const forgetRows = () => { memo = null }

const byDate = (a: Row, b: Row) => b.date.localeCompare(a.date) || String(b.page.created_time).localeCompare(String(a.page.created_time))

/**
 * English rows for every locale, with a translated row taking an English
 * row's place when both share a Slug. Nothing 404s while translations are
 * missing, and one article can be translated at a time.
 */
function forLocale(rows: Row[], locale: Locale): Row[] {
  const base = rows.filter(r => r.lang === DEFAULT_LOCALE || !r.lang)
  if (locale === DEFAULT_LOCALE) return base.sort(byDate)
  const translated = rows.filter(r => r.lang === locale)
  const bySlug = new Map(translated.map(r => [r.slug, r]))
  const baseSlugs = new Set(base.map(r => r.slug))
  return [...base.map(r => bySlug.get(r.slug) ?? r), ...translated.filter(r => !baseSlugs.has(r.slug))].sort(byDate)
}

/* ── bodies ───────────────────────────────────────────────── */

async function getBlocks(blockId: string, depth = 0): Promise<any[]> {
  if (depth > 4) return []
  const out: any[] = []
  let cursor: string | undefined
  do {
    const res = await notion.blocks.children.list({ block_id: blockId, start_cursor: cursor, page_size: 100 })
    for (const b of res.results as any[]) {
      if (b.has_children && !['child_page', 'child_database'].includes(b.type)) {
        // One unreadable nested block (e.g. a synced block from a page the
        // connection can't see) loses only its own children, not the article.
        try { b.children = await getBlocks(b.id, depth + 1) } catch (e: any) {
          console.warn('[notion] could not read children of block', b.id, e?.code ?? e?.message)
          b.children = []
        }
      }
      out.push(b)
    }
    cursor = res.has_more ? (res.next_cursor as string) : undefined
  } while (cursor)
  return out
}

/**
 * The rendered body, cached by the page's last-edited time, so the list pages
 * can show a real reading time without re-reading every article on every
 * refresh. Notion rounds that time to the minute, so a page edited in the last
 * few minutes is read fresh (a second edit in the same minute would otherwise
 * keep the old key), and cached copies expire after six hours regardless.
 */
const cachedBody = unstable_cache(
  async (pageId: string, _edited: string): Promise<Rendered> => renderArticle(await getBlocks(pageId)),
  ['notion-body-v2'],
  { revalidate: 60 * 60 * 6, tags: ['notion-body'] },
)

async function bodyOf(page: any): Promise<Rendered> {
  const edited = String(page.last_edited_time ?? '')
  const recent = Date.now() - Date.parse(edited) < 3 * 60_000
  return recent ? renderArticle(await getBlocks(page.id)) : cachedBody(page.id, edited)
}

const EMPTY: Rendered = { html: '', toc: [], references: [], words: 0 }

async function mapLimit<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let next = 0
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i]!) }
  }))
  return out
}

/* ── mapping ──────────────────────────────────────────────── */

function toInsight(row: Row, r: Rendered, withBody: boolean): Insight {
  const { page } = row
  const p = page.properties
  const type = pSelect(p, P.type) === 'Video' ? 'Video' : 'Article'
  const [coverCaption, coverCredit] = splitCredit(pText(p, P.coverCaption))
  return {
    id: page.id,
    slug: row.slug,
    lang: row.lang,
    title: pageTitle(page),
    excerpt: pText(p, P.subtitle),
    topic: pSelect(p, P.topic) || null,
    type,
    videoUrl: pUrl(p, P.videoUrl),
    cover: mediaSrc(page.cover, { kind: 'cover', id: page.id, edited: page.last_edited_time }),
    coverCaption,
    coverCredit,
    tags: pMulti(p, P.tags),
    date: row.date,
    updated: page.last_edited_time ?? null,
    // 0 = unknown (the body could not be read); pages then leave the time out.
    readingMinutes: (type === 'Video' ? pNumber(p, P.videoMinutes) : null) ?? (r.words ? readingMinutes(r.words) : 0),
    notionUrl: page.public_url ?? null,
    body: withBody ? r.html : '',
    toc: withBody ? r.toc : [],
    references: withBody ? r.references : [],
  }
}

/* ── public api ───────────────────────────────────────────── */

/** The list: one article that cannot be read loses its reading time, never the page. */
export async function notionInsights(locale: Locale, limit?: number): Promise<Insight[]> {
  const rows = forLocale(await allRows(), locale)
  const pick = limit ? rows.slice(0, limit) : rows
  return mapLimit(pick, 3, async row => {
    let r = EMPTY
    try { r = await bodyOf(row.page) } catch (e: any) {
      console.warn(`[notion] "${pageTitle(row.page)}": body could not be read for the list —`, e?.code ?? e?.message)
    }
    return toInsight(row, r, false)
  })
}

export async function notionInsight(locale: Locale, slug: string): Promise<Insight | null> {
  const rows = forLocale(await allRows(), locale)
  let row = rows.find(r => r.slug === slug)
  // An old address after a headline edit: the id tail matches an article whose
  // address is made from its headline (never one with its own Slug). The page redirects.
  if (!row) {
    const m = slug.match(/^(.+)-([0-9a-f]{6})$/)
    if (m) row = rows.find(r => !explicitSlug(r.page) && idTail(r.page.id) === m[2])
  }
  if (!row) return null
  return toInsight(row, await bodyOf(row.page), true)
}

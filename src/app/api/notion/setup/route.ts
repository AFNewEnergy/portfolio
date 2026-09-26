import { timingSafeEqual } from 'node:crypto'
import { revalidatePath, revalidateTag } from 'next/cache'
import { clientIp, secretFailed, secretLocked } from '@/lib/rate-limit'
import type { NextRequest } from 'next/server'
import { site } from '@/config/site'
import { INSIGHTS_DB_TITLE, P, insightsProperties } from '@/content/notion/schema'
import { SAMPLE_ARTICLES, WRITING_GUIDE, type SampleArticle } from '@/content/samples/articles'
import type { NBlock } from '@/content/samples/dsl'

/**
 * One-time setup:  /api/notion/setup?secret=REVALIDATE_SECRET
 *
 * Opening the link (GET) only looks: it reports what exists and shows a
 * button. Pressing the button (POST) does the work, so a chat app previewing
 * the link, or a browser prefetching it, can never create anything.
 *
 * The work: create the Insights database inside the page the Notion
 * connection was given (the "Website" page), with every column the site
 * reads, the sample articles and an unpublished writing guide. Once the
 * database exists, the same page offers to put back any sample that was
 * deleted, and nothing else.
 *
 * It runs on the live site because that is where the Notion token lives.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function page(title: string, body: string, status = 200) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)}</title>
<style>body{margin:0;background:#faf8f4;color:#14171a;font:16px/1.6 system-ui,-apple-system,sans-serif}main{max-width:680px;margin:0 auto;padding:48px 20px}
h1{font:400 32px/1.15 Georgia,serif;margin:0 0 20px}p,li{color:#4a4f55}code{background:#f2efe8;padding:2px 6px}a{color:#0b6c63}
.box{border:1px solid #c4bca9;border-left:3px solid #0b6c63;background:#fff;padding:16px 20px;margin:20px 0}.bad{border-left-color:#a8322b}
ol,ul{padding-left:22px}li{margin:6px 0}@media(prefers-color-scheme:dark){body{background:#0c1013;color:#edf0f2}p,li{color:#a3adb6}.box{background:#141a1f;border-color:#35414b}code{background:#141a1f}a{color:#4cc9b8}}</style>
</head><body><main><h1>${esc(title)}</h1>${body}</main></body></html>`
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })
}

function secretOk(given: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

const text = (content: string) => [{ type: 'text' as const, text: { content } }]

/**
 * The site's permanent address, for the sample photos stored in Notion. Not the
 * address the link was opened on: a preview or per-deployment vercel.app
 * address stops working (or sits behind Vercel's login) after the next deploy.
 */
function siteOrigin(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return site.url
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  return req.nextUrl.origin
}

/** Site paths like /photos/x.jpg become full URLs: Notion only accepts absolute links. */
function absolute(blocks: NBlock[], origin: string): NBlock[] {
  return blocks.map(b => {
    const v = { ...b[b.type] }
    if (b.type === 'image' && v.external?.url?.startsWith('/')) v.external = { url: origin + v.external.url }
    if (Array.isArray(v.children)) v.children = absolute(v.children, origin)
    return { ...b, [b.type]: v }
  })
}

function properties(a: SampleArticle, withSlug: boolean) {
  return {
    [P.title]: { title: text(a.title) },
    [P.subtitle]: { rich_text: text(a.subtitle) },
    [P.published]: { checkbox: a.published },
    [P.date]: { date: { start: a.date } },
    [P.topic]: { select: { name: a.topic } },
    [P.tags]: { multi_select: a.tags.map(name => ({ name })) },
    [P.type]: { select: { name: 'Article' } },
    [P.coverCaption]: { rich_text: text(a.coverCaption) },
    ...(withSlug ? { [P.slug]: { rich_text: text(a.slug) } } : {}),
  }
}

async function createArticle(notion: any, dataSourceId: string, a: SampleArticle, origin: string, isGuide: boolean) {
  await notion.pages.create({
    parent: { type: 'data_source_id', data_source_id: dataSourceId },
    ...(isGuide ? { icon: { type: 'emoji', emoji: '✍️' } } : {}),
    cover: { type: 'external', external: { url: origin + a.cover } },
    properties: properties(a, !isGuide),
    children: absolute(a.blocks, origin),
  })
}

const titleOf = (p: any) =>
  ((Object.values(p?.properties ?? {}).find((x: any) => x?.type === 'title') as any)?.title ?? [])
    .map((t: any) => t.plain_text).join('').trim()

function explain(e: any): string {
  const code = e?.code ?? ''
  if (code === 'unauthorized') return 'Notion did not accept the token. Copy the Installation access token again and update NOTION_TOKEN in Vercel, then redeploy.'
  if (code === 'restricted_resource') return 'The connection is not allowed to add content. In Notion’s Developer portal, open the connection → Configuration → Capabilities and tick Read, Insert and Update content.'
  if (code === 'object_not_found') return 'The connection cannot see the Website page. Open the page in Notion → ••• → Connections → add the connection.'
  if (code === 'rate_limited') return 'Notion asked us to slow down. Wait a minute and try again.'
  return `Notion said: ${e?.message ?? String(e)}`
}

function guard(secret: string | null, ip: string): Response | null {
  if (!process.env.REVALIDATE_SECRET) {
    return page('Setup is locked', '<p>Add <code>REVALIDATE_SECRET</code> in Vercel (Settings, Environment Variables), redeploy, then open this link again with <code>?secret=</code> and that value.</p>', 500)
  }
  if (secretLocked(ip)) return page('Too many attempts', '<p>Too many wrong secrets from this address. Try again in an hour.</p>', 429)
  if (!secretOk(secret)) {
    secretFailed(ip)
    return page('Wrong secret', '<p>Add <code>?secret=</code> followed by the exact value of <code>REVALIDATE_SECRET</code> from Vercel to the end of this address.</p>', 401)
  }
  if (!process.env.NOTION_TOKEN) {
    return page('Notion is not connected yet', '<p>Add <code>NOTION_TOKEN</code> in Vercel (the Installation access token from Notion), redeploy, then open this link again.</p>', 500)
  }
  return null
}

const button = (secret: string, action: 'create' | 'samples', label: string) =>
  `<form method="post"><input type="hidden" name="secret" value="${esc(secret)}"><input type="hidden" name="action" value="${action}">
   <button type="submit" style="font:500 15px system-ui;padding:12px 20px;background:#0b6c63;color:#fff;border:0;border-radius:2px;cursor:pointer">${esc(label)}</button></form>`

async function findExisting() {
  const { findInsightsDataSource } = await import('@/content/notion/insights')
  try { return await findInsightsDataSource() } catch (e: any) { if (e?.name === 'NotSetUp') return null; throw e }
}

async function allRows(notion: any, dataSourceId: string) {
  const rows: any[] = []
  let cursor: string | undefined
  do {
    const res: any = await notion.dataSources.query({ data_source_id: dataSourceId, start_cursor: cursor, page_size: 100 })
    rows.push(...res.results.filter((r: any) => r.object === 'page' && !r.in_trash))
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)
  return rows
}

const slugOfRow = (r: any) => (r.properties?.[P.slug]?.rich_text ?? []).map((t: any) => t.plain_text).join('').trim()

/** GET: look, don't touch. */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  const blocked = guard(secret, clientIp(req.headers))
  if (blocked) return blocked
  const { notion } = await import('@/content/notion/client')
  try {
    const existing = await findExisting()
    if (!existing) {
      return page('Ready to set up Insights', `
        <div class="box"><p>This creates an <strong>Insights</strong> database in your Notion <strong>Website</strong> page, with ${SAMPLE_ARTICLES.length} sample articles and a writing guide. Nothing on the website changes until you press the button.</p></div>
        ${button(secret!, 'create', 'Create the Insights database')}`)
    }
    const rows = await allRows(notion, existing)
    const slugs = new Set(rows.map(slugOfRow))
    const missing = SAMPLE_ARTICLES.filter(a => !slugs.has(a.slug))
    const published = rows.filter(r => r.properties?.[P.published]?.checkbox).length
    const ds: any = await notion.dataSources.retrieve({ data_source_id: existing })
    return page('Insights is set up', `
      <div class="box"><p>The Insights database has <strong>${rows.length}</strong> page(s), ${published} of them published.</p></div>
      <p><a href="${esc(ds.url ?? 'https://www.notion.so')}">Open it in Notion</a> · <a href="/en/insights">See the Insights page</a></p>
      <p>New articles appear on the site within about five minutes of ticking Published. Nothing else to do here.</p>
      <p style="color:#555">Optional, for extra reliability: add <code>NOTION_INSIGHTS_DS</code> = <code>${esc(existing)}</code> in Vercel (Settings, Environment Variables) and redeploy. The site then goes straight to this database instead of searching Notion for it.</p>
      ${missing.length ? `<p>${missing.length} sample article(s) are no longer in the database. You only need this if you deleted them by mistake:</p>${button(secret!, 'samples', `Put back ${missing.length} sample article(s)`)}` : ''}`)
  } catch (e: any) {
    console.error('[notion-setup] status failed', e?.code, e?.message)
    return page('Could not reach Notion', `<div class="box bad"><p>${esc(explain(e))}</p></div>`, 500)
  }
}

let running = false

/** POST: do it. */
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null)
  const secret = typeof form?.get('secret') === 'string' ? (form!.get('secret') as string) : null
  const action = form?.get('action')
  const blocked = guard(secret, clientIp(req.headers))
  if (blocked) return blocked
  if (running) return page('Already running', '<p>Setup is already running. Wait a minute, then open the link again to see the result.</p>', 409)
  running = true

  const { notion } = await import('@/content/notion/client')
  const { forgetRows, forgetDataSource } = await import('@/content/notion/insights')
  const origin = siteOrigin(req)
  const done = () => { forgetRows(); forgetDataSource(); revalidateTag('notion-insights-ds'); revalidatePath('/', 'layout') }

  try {
    const existing = await findExisting()

    if (existing) {
      if (action !== 'samples') return page('Insights is already set up', '<p>The database already exists, so nothing was created. <a href="/en/insights">See the Insights page</a>.</p>')
      const rows = await allRows(notion, existing)
      const slugs = new Set(rows.map(slugOfRow))
      const added: string[] = []
      for (const a of SAMPLE_ARTICLES) {
        if (slugs.has(a.slug)) continue
        await createArticle(notion, existing, a, origin, false)
        added.push(a.title)
      }
      if (!rows.some(r => titleOf(r) === WRITING_GUIDE.title)) { await createArticle(notion, existing, WRITING_GUIDE, origin, true); added.push(WRITING_GUIDE.title) }
      done()
      return page('Samples put back', `<div class="box"><p>${added.length ? `Added: ${added.map(esc).join(', ')}.` : 'Nothing was missing.'}</p></div><p><a href="/en/insights">See the Insights page</a></p>`)
    }

    // Find the page the connection was given.
    const found: any = await notion.search({ filter: { property: 'object', value: 'page' }, page_size: 50 })
    const pages = found.results.filter((p: any) => p.object === 'page' && !p.in_trash)
    const top = pages.filter((p: any) => p.parent?.type === 'workspace')
    const parent = pages.find((p: any) => titleOf(p).toLowerCase() === 'website') ?? (top.length === 1 ? top[0] : undefined)
    if (!parent) {
      return page('Which page should it go in?', `<div class="box bad"><p>The connection cannot see a page called <strong>Website</strong>.</p></div>
        <p>In Notion, open the Website page, click <strong>•••</strong> (top right), then <strong>Connections</strong>, and add the website connection. Then open this link again.</p>
        <p>Pages the connection can see: ${pages.length ? pages.map((p: any) => esc(titleOf(p) || '(untitled)')).join(', ') : 'none'}.</p>`, 409)
    }

    const db: any = await notion.databases.create({
      parent: { type: 'page_id', page_id: parent.id },
      title: text(INSIGHTS_DB_TITLE),
      description: text('Articles for the Insights page on the website. Tick Published to show one; untick it to hide it.'),
      icon: { type: 'emoji', emoji: '📰' },
      initial_data_source: { properties: insightsProperties() as any },
    })
    const newId: string | undefined = db.data_sources?.[0]?.id
    if (!newId) throw new Error('Notion created the database but returned no data source.')

    await createArticle(notion, newId, WRITING_GUIDE, origin, true)
    for (const a of [...SAMPLE_ARTICLES].reverse()) await createArticle(notion, newId, a, origin, false)
    done()

    return page('Insights is ready', `
      <div class="box"><p>Created the <strong>Insights</strong> database inside <strong>${esc(titleOf(parent) || 'your page')}</strong>, with ${SAMPLE_ARTICLES.length} published sample articles and a writing guide (not published).</p></div>
      <ol>
        <li><a href="${esc(db.url ?? parent.url ?? 'https://www.notion.so')}">Open Insights in Notion</a> and read the “✍️ Writing guide” page.</li>
        <li><a href="/en/insights">See the Insights page</a>. It now reads from Notion.</li>
        <li>Optional: in Notion’s Developer portal, set the connection’s capabilities to <strong>Read content</strong> only. The site never writes again.</li>
      </ol>
      <p>You don’t need this link again.</p>`)
  } catch (e: any) {
    console.error('[notion-setup] failed', e?.code, e?.message)
    return page('Setup could not finish', `<div class="box bad"><p>${esc(explain(e))}</p></div><p>Fix that and open the link again. If the database was already created, the page will offer to add whatever is missing.</p>`, 500)
  } finally {
    running = false
  }
}

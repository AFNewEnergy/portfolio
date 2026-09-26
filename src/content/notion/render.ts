/**
 * Notion blocks → article HTML.
 *
 * Written by hand rather than pulling in notion-to-md: those packages lag
 * behind Notion's API versions and break on upgrade, and none of them know
 * this site's article format. What Faisal types in Notion maps like this:
 *
 *   Heading 1                 numbered section, listed in "On this page"
 *   Heading 2 / 3             sub-headings
 *   Image                     photo the width of the text
 *     caption "Wide: …"       photo that runs past the text into the margin
 *     caption "Small: …"      small photo with the text wrapping round it
 *     caption "… | Photo: X"  credit, shown on the right
 *   Images side by side       gallery (drag images into columns)
 *   Callout with a list       "Key takeaways" box — the callout text is the label
 *   Quote                     pull quote; a last line starting with - is the name
 *   Table                     table; a line "Table 1 · …" just above is its title
 *   Numbered list             numbered rows with large figures
 *   Heading "References"      everything under it becomes the References tab;
 *                             [1], [2]… in the text link to those entries
 *
 * If the article uses no Heading 1, Heading 2 becomes the section level, so
 * either habit works. Unknown block types are skipped, never fatal.
 */
import type { Reference, TocItem } from '../types'
import { imgAttrString } from '@/lib/img'
import { slugify } from '@/lib/slug'
import { mediaSrc, stamp } from './media'

type Block = any
type RT = any

export type Rendered = { html: string; toc: TocItem[]; references: Reference[]; words: number }

type Ctx = {
  refCount: number
  toc: TocItem[]
  ids: Set<string>
  level: number
  numbered: boolean
  section: number
  words: number
}

/* ── text ─────────────────────────────────────────────────── */

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const textOf = (t: RT): string => t?.plain_text ?? t?.text?.content ?? ''
export const plainOf = (rt: RT[] = []): string => rt.map(textOf).join('')

const words = (s: string) => {
  const cjk = s.match(/[぀-ヿ㐀-鿿]/g)?.length ?? 0
  return (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu)?.length ?? 0) + Math.round(cjk / 2)
}

/** Only links a visitor can follow. Notion-internal "/page-id" links are dropped. */
function safeHref(h?: string | null): string | null {
  if (!h) return null
  const v = h.trim()
  if (/^(https?:|mailto:|tel:)/i.test(v) || v.startsWith('#')) return v
  return null
}

/** Characters [start, end) of a rich-text array, keeping each run's formatting. */
function sliceRich(rt: RT[] = [], start: number, end = Infinity): RT[] {
  const out: RT[] = []
  let at = 0
  for (const t of rt) {
    const s = textOf(t)
    const from = Math.max(start, at)
    const to = Math.min(end, at + s.length)
    if (to > from) out.push({ ...t, plain_text: s.slice(from - at, to - at), text: t.text ? { ...t.text, content: s.slice(from - at, to - at) } : undefined })
    at += s.length
  }
  return out
}

function cites(html: string, ctx: Ctx): string {
  if (!ctx.refCount) return html
  return html.replace(/\[(\d{1,3}(?:\s*,\s*\d{1,3})*)\]/g, (whole, list: string) => {
    const ns = list.split(',').map(n => Number(n.trim()))
    if (!ns.every(n => n >= 1 && n <= ctx.refCount)) return whole
    return ns.map(n => `<a class="cite" href="#ref-${n}">[${n}]</a>`).join('')
  })
}

export function inline(rt: RT[] = [], ctx?: Ctx): string {
  return rt
    .map(t => {
      const text = textOf(t)
      if (t.type === 'equation') return `<span class="math">${esc(t.equation?.expression ?? text)}</span>`
      const a = t.annotations ?? {}
      const href = safeHref(t.href ?? t.text?.link?.url)
      let s = esc(text)
      if (ctx && !a.code && !href) s = cites(s, ctx)
      s = s.replace(/\n/g, '<br>')
      if (a.code) s = `<code>${s}</code>`
      if (a.bold) s = `<strong>${s}</strong>`
      if (a.italic) s = `<em>${s}</em>`
      if (a.underline) s = `<u>${s}</u>`
      if (a.strikethrough) s = `<s>${s}</s>`
      if (typeof a.color === 'string' && a.color.endsWith('_background')) s = `<mark>${s}</mark>`
      if (href) {
        const ext = /^https?:/i.test(href)
        s = `<a href="${esc(href)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${s}</a>`
      }
      return s
    })
    .join('')
}

/* ── references ───────────────────────────────────────────── */

const REFS = /^(references?|sources?|bibliography|notes and references|further reading)$/i
const HEADINGS = ['heading_1', 'heading_2', 'heading_3', 'heading_4']
const headingLevel = (b: Block) => HEADINGS.indexOf(b?.type) + 1
const isRefsHeading = (b: Block) =>
  headingLevel(b) > 0 && REFS.test(plainOf(b[b.type]?.rich_text).trim().replace(/[:：]$/, ''))

const REF_TYPES = ['numbered_list_item', 'bulleted_list_item', 'paragraph', 'bookmark', 'link_preview']

/** Everything under the References heading that can be a source becomes one;
 *  anything else there (a stray photo, a table) stays in the article. */
function splitReferences(blocks: Block[]): { body: Block[]; refs: Block[] } {
  const i = blocks.findIndex(isRefsHeading)
  if (i < 0) return { body: blocks, refs: [] }
  const lvl = headingLevel(blocks[i])
  let j = i + 1
  while (j < blocks.length && !(headingLevel(blocks[j]) > 0 && headingLevel(blocks[j]) <= lvl)) j++
  const region = blocks.slice(i + 1, j)
  return {
    body: [...blocks.slice(0, i), ...region.filter(b => !REF_TYPES.includes(b.type)), ...blocks.slice(j)],
    refs: region.filter(b => REF_TYPES.includes(b.type)),
  }
}

function toReference(b: Block, n: number): Reference | null {
  const v = b[b.type]
  if (b.type === 'bookmark' || b.type === 'link_preview') {
    const url = safeHref(v?.url)
    const cap = plainOf(v?.caption).trim()
    return url ? { n, title: cap || url.replace(/^https?:\/\/(www\.)?/, ''), url, source: null } : null
  }
  const rt: RT[] = v?.rich_text ?? []
  const all = plainOf(rt).replace(/^\s*\[\d+\]\s*/, '').trim()
  if (!all) return null

  // The first linked run is the title; whatever follows it is the source line.
  const k = rt.findIndex(t => safeHref(t.href ?? t.text?.link?.url))
  if (k >= 0) {
    const href = safeHref(rt[k].href ?? rt[k].text?.link?.url)!
    let end = k
    while (end + 1 < rt.length && safeHref(rt[end + 1].href ?? rt[end + 1].text?.link?.url) === href) end++
    const title = plainOf(rt.slice(k, end + 1)).trim()
    const before = plainOf(rt.slice(0, k)).replace(/^\s*\[\d+\]\s*/, '').trim()
    const after = plainOf(rt.slice(end + 1)).trim()
    const source = [before, after].filter(Boolean).join(' ').replace(/^[\s—–\-·,:|.]+/, '').trim()
    return { n, title: title || href, url: href, source: source || null }
  }
  const m = all.match(/https?:\/\/\S+/)
  if (m) {
    const title = all.replace(m[0], '').replace(/[\s—–\-·,:|]+$/, '').trim()
    return { n, title: title || m[0], url: m[0].replace(/[).,]+$/, ''), source: null }
  }
  // "Title | Source" (or "Title – Source") without a link
  const parts = all.split(/\s[|—–]\s/)
  return { n, title: (parts[0] ?? all).trim(), url: null, source: parts.slice(1).join(', ').trim() || null }
}

function parseReferences(blocks: Block[]): Reference[] {
  const out: Reference[] = []
  for (const b of blocks) {
    const r = toReference(b, out.length + 1)
    if (r) out.push(r)
  }
  return out
}

/* ── figures ──────────────────────────────────────────────── */

const SIZES = {
  wide: '(max-width: 1080px) 92vw, 1000px',
  col: '(max-width: 760px) 92vw, 720px',
  small: '(max-width: 640px) 92vw, 300px',
  gallery: '(max-width: 640px) 46vw, 360px',
} as const

type Caption = { mode: 'wide' | 'small' | 'col'; html: string; alt: string; credit: string }

function parseCaption(rt: RT[] = [], ctx: Ctx): Caption {
  const plain = plainOf(rt)
  const m = plain.match(/^\s*(wide|large|full|small)\s*[:：]\s*/i)
  const mode = !m ? 'col' : m[1]!.toLowerCase() === 'small' ? 'small' : 'wide'
  const rest = sliceRich(rt, m ? m[0].length : 0)
  const restPlain = plainOf(rest)
  const bar = restPlain.lastIndexOf(' | ')
  const main = bar >= 0 ? sliceRich(rest, 0, bar) : rest
  const credit = bar >= 0 ? restPlain.slice(bar + 3).trim() : ''
  const alt = plainOf(main).trim()
  ctx.words += words(alt)
  return { mode, html: inline(main, ctx).trim(), alt, credit }
}

const figcaption = (c: { html: string; credit: string }) =>
  c.html || c.credit
    ? `<figcaption class="fig-cap"><span>${c.html}</span>${c.credit ? `<span class="fig-credit">${esc(c.credit)}</span>` : ''}</figcaption>`
    : ''

const imageSrc = (b: Block) => mediaSrc(b.image, { kind: 'block', id: b.id, edited: b.last_edited_time })

const imgTag = (src: string, sizes: string, alt: string) =>
  `<img ${imgAttrString(src, sizes)} alt="${esc(alt)}" loading="lazy" decoding="async">`

function figure(b: Block, ctx: Ctx): string {
  const src = imageSrc(b)
  if (!src) return ''
  const c = parseCaption(b.image?.caption, ctx)
  return `<figure class="fig fig--${c.mode}"><div class="fig-frame">${imgTag(src, SIZES[c.mode], c.alt)}</div>${figcaption(c)}</figure>`
}

function gallery(images: Block[], ctx: Ctx): string {
  const items = images
    .map(b => ({ src: imageSrc(b), c: parseCaption(b.image?.caption, ctx) }))
    .filter(x => x.src)
  if (!items.length) return ''
  const captioned = items.filter(x => x.c.html || x.c.credit)
  const single = captioned.length === 1
  const frames = items
    .map(x => `<div class="gallery-item"><div class="fig-frame">${imgTag(x.src!, SIZES.gallery, x.c.alt)}</div>${
      !single && (x.c.html || x.c.credit) ? figcaption(x.c).replace('<figcaption', '<p').replace('</figcaption>', '</p>') : ''
    }</div>`)
    .join('')
  return `<figure class="fig fig--gallery" style="--cols:${Math.min(items.length, 4)}"><div class="gallery">${frames}</div>${single ? figcaption(captioned[0]!.c) : ''}</figure>`
}

/* ── embeds ───────────────────────────────────────────────── */

export function videoEmbedUrl(url?: string | null): string | null {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?dnt=1`
  return null
}

const host = (url: string) => {
  try {
    const u = new URL(url)
    return (u.host.replace(/^www\./, '') + u.pathname.replace(/\/$/, '')).slice(0, 64)
  } catch {
    return url
  }
}

function linkCard(url: string, title: string, label?: string): string {
  return `<a class="bookmark" href="${esc(url)}" target="_blank" rel="noopener noreferrer"><span class="bookmark-title">${esc(title)}</span><span class="bookmark-url">${esc(label ?? host(url))}</span></a>`
}

/* ── blocks ───────────────────────────────────────────────── */

function heading(b: Block, ctx: Ctx): string {
  const v = b[b.type]
  const level = headingLevel(b)
  const text = plainOf(v.rich_text).trim()
  if (!text) return ''
  ctx.words += words(text)
  const body = inline(v.rich_text, ctx)

  if (v.is_toggleable) {
    return `<details class="toggle"><summary>${body}</summary><div class="toggle-body">${renderList(b.children ?? [], ctx)}</div></details>`
  }

  const id = uniqueId(slugify(text, 48) || `section-${ctx.section + 1}`, ctx)
  if (level === ctx.level) {
    ctx.section++
    const n = String(ctx.section).padStart(2, '0')
    ctx.toc.push({ id, n, label: text })
    return `<h2 id="${id}" class="a-sec">${ctx.numbered ? `<span class="h-num">${n}</span>` : ''}<span>${body}</span></h2>`
  }
  return level === ctx.level + 1 ? `<h3 id="${id}">${body}</h3>` : `<h4 id="${id}">${body}</h4>`
}

/** Ids the article page itself uses; a heading must never take one. */
const RESERVED = new Set(['references', 'main', 'more-head', 'tab-refs', 'tab-cite', 'panel-refs', 'panel-cite'])
const taken = (id: string, ctx: Ctx) => ctx.ids.has(id) || RESERVED.has(id) || /^ref-\d+$/.test(id)

function uniqueId(base: string, ctx: Ctx): string {
  let id = base
  for (let i = 2; taken(id, ctx); i++) id = `${base}-${i}`
  ctx.ids.add(id)
  return id
}

function quote(b: Block, ctx: Ctx): string {
  const rt: RT[] = b.quote?.rich_text ?? []
  const plain = plainOf(rt)
  let body = rt
  let who = ''
  const nl = plain.lastIndexOf('\n')
  if (nl >= 0 && /^\s*[—–-]\s?\S/.test(plain.slice(nl + 1))) {
    who = plain.slice(nl + 1).trim()
    body = sliceRich(rt, 0, nl)
  }
  for (const c of b.children ?? []) {
    const t = plainOf(c[c.type]?.rich_text).trim()
    if (!who && /^[—–-]\s?\S/.test(t)) who = t
  }
  // The dash only marks the line as a name; the page draws its own accent rule instead.
  who = who.replace(/^[—–-]\s*/, '')
  const text = plainOf(body).trim()
  if (!text) return ''
  ctx.words += words(text)
  const quoted = /^["“‘'«]/.test(text) ? inline(body, ctx) : `“${inline(body, ctx).trim()}”`
  return `<figure class="pull"><blockquote><p>${quoted}</p></blockquote>${who ? `<figcaption>${esc(who)}</figcaption>` : ''}</figure>`
}

function callout(b: Block, ctx: Ctx): string {
  const v = b.callout
  const label = inline(v.rich_text, ctx)
  ctx.words += words(plainOf(v.rich_text))
  const kids = b.children ?? []
  if (kids.length) {
    return `<aside class="callout">${label ? `<p class="callout-label">${label}</p>` : ''}${renderList(kids, ctx)}</aside>`
  }
  return label ? `<aside class="callout callout--note"><p>${label}</p></aside>` : ''
}

function table(b: Block, ctx: Ctx, caption: string): string {
  const v = b.table ?? {}
  const rows: RT[][][] = (b.children ?? []).filter((r: Block) => r.type === 'table_row').map((r: Block) => r.table_row.cells ?? [])
  if (!rows.length) return ''
  const head = v.has_column_header ? rows.shift()! : null
  const labels = head?.map(c => plainOf(c).trim()) ?? []
  for (const r of rows) for (const c of r) ctx.words += words(plainOf(c))
  const thead = head ? `<thead><tr>${head.map(c => `<th scope="col">${inline(c, ctx)}</th>`).join('')}</tr></thead>` : ''
  const tbody = rows
    .map(r => `<tr>${r.map((c, i) => {
      const label = labels[i] ? ` data-label="${esc(labels[i])}"` : ''
      return v.has_row_header && i === 0 ? `<th scope="row"${label}>${inline(c, ctx)}</th>` : `<td${label}>${inline(c, ctx)}</td>`
    }).join('')}</tr>`)
    .join('')
  return `<figure class="table-fig"${head ? ' data-stack="true"' : ''}><div class="table-wrap"><table>${caption ? `<caption>${caption}</caption>` : ''}${thead}<tbody>${tbody}</tbody></table></div></figure>`
}

function columns(b: Block, ctx: Ctx): string {
  const cols: Block[] = (b.children ?? []).filter((c: Block) => c.type === 'column')
  const kids = cols.flatMap(c => c.children ?? [])
  if (kids.length > 1 && kids.every(k => k.type === 'image')) return gallery(kids, ctx)
  return `<div class="cols" style="--cols:${Math.max(1, Math.min(cols.length, 4))}">${cols
    .map(c => `<div class="col">${renderList(c.children ?? [], ctx)}</div>`)
    .join('')}</div>`
}

function fileLink(b: Block): string {
  const v = b[b.type] ?? {}
  const name = plainOf(v.caption).trim() || v.name || (b.type === 'pdf' ? 'PDF document' : 'Download file')
  if (v.type === 'external' && safeHref(v.external?.url)) return linkCard(v.external.url, name)
  if (v.type === 'file' || v.type === 'file_upload') {
    const id = String(b.id).replace(/-/g, '')
    return linkCard(`/api/notion/file/${id}/${stamp(b.last_edited_time)}`, name, b.type === 'pdf' ? 'PDF' : 'File')
  }
  return ''
}

function video(b: Block, ctx: Ctx): string {
  const v = b[b.type] ?? {}
  const url = v.type === 'external' ? v.external?.url : v.url
  const embed = videoEmbedUrl(url)
  const cap = parseCaption(v.caption, ctx)
  if (embed) {
    return `<figure class="fig fig--col"><div class="video"><iframe src="${esc(embed)}" title="${esc(cap.alt || 'Video')}" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div>${figcaption(cap)}</figure>`
  }
  if (b.type === 'video' && (v.type === 'file' || v.type === 'file_upload')) {
    const id = String(b.id).replace(/-/g, '')
    return `<figure class="fig fig--col"><div class="video"><video controls preload="none" src="/api/notion/file/${id}/${stamp(b.last_edited_time)}"></video></div>${figcaption(cap)}</figure>`
  }
  const href = safeHref(url)
  return href ? linkCard(href, cap.alt || host(href)) : ''
}

const TABLE_TITLE = /^\s*table\s*\d*\s*[·:.\-–—|]/i

function renderList(blocks: Block[], ctx: Ctx, depth = 0): string {
  let html = ''
  let list: 'ul' | 'ol' | 'todo' | null = null
  const close = () => {
    if (list) html += list === 'todo' ? '</ul>' : `</${list}>`
    list = null
  }
  const open = (k: 'ul' | 'ol' | 'todo') => {
    if (list === k) return
    close()
    html += k === 'todo' ? '<ul class="todo">' : k === 'ol' ? `<ol${depth === 0 ? ' class="steps"' : ''}>` : '<ul>'
    list = k
  }
  const kids = (b: Block) => (b.children?.length ? renderList(b.children, ctx, depth + 1) : '')

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    const v = b?.[b?.type]
    if (!v && b?.type !== 'divider') { close(); continue }

    switch (b.type) {
      case 'paragraph': {
        close()
        const next = blocks[i + 1]
        const plain = plainOf(v.rich_text)
        if (next?.type === 'table' && TABLE_TITLE.test(plain)) {
          ctx.words += words(plain)
          html += table(next, ctx, inline(v.rich_text, ctx))
          i++
          break
        }
        if (plain.trim()) {
          ctx.words += words(plain)
          html += `<p>${inline(v.rich_text, ctx)}</p>`
        }
        if (b.children?.length) html += `<div class="indent">${kids(b)}</div>`
        break
      }
      case 'heading_1': case 'heading_2': case 'heading_3': case 'heading_4':
        close(); html += heading(b, ctx); break
      case 'bulleted_list_item':
        open('ul'); ctx.words += words(plainOf(v.rich_text))
        html += `<li>${inline(v.rich_text, ctx)}${kids(b)}</li>`; break
      case 'numbered_list_item':
        open('ol'); ctx.words += words(plainOf(v.rich_text))
        html += `<li><div>${inline(v.rich_text, ctx)}${kids(b)}</div></li>`; break
      case 'to_do':
        open('todo'); ctx.words += words(plainOf(v.rich_text))
        html += `<li${v.checked ? ' class="is-done"' : ''}><span class="todo-box" aria-hidden="true"></span><span>${inline(v.rich_text, ctx)}${kids(b)}</span></li>`; break
      case 'quote': close(); html += quote(b, ctx); break
      case 'callout': close(); html += callout(b, ctx); break
      case 'toggle':
        close(); ctx.words += words(plainOf(v.rich_text))
        html += `<details class="toggle"><summary>${inline(v.rich_text, ctx)}</summary><div class="toggle-body">${kids(b)}</div></details>`; break
      case 'divider': close(); html += '<hr>'; break
      case 'code': close(); html += `<pre class="code"><code>${esc(plainOf(v.rich_text))}</code></pre>`; break
      case 'equation': close(); html += `<div class="math">${esc(v.expression ?? '')}</div>`; break
      case 'image': close(); html += figure(b, ctx); break
      case 'column_list': close(); html += columns(b, ctx); break
      case 'column': close(); html += kids(b); break
      case 'table': close(); html += table(b, ctx, ''); break
      case 'video': case 'embed': close(); html += video(b, ctx); break
      case 'bookmark': case 'link_preview': {
        close()
        const url = safeHref(v.url)
        if (url) html += linkCard(url, plainOf(v.caption).trim() || host(url))
        break
      }
      case 'pdf': case 'file': case 'audio': close(); html += fileLink(b); break
      case 'synced_block': close(); html += kids(b); break
      default:
        close() // child pages, databases, table of contents, breadcrumbs…
    }
  }
  close()
  return html
}

/* ── entry points ─────────────────────────────────────────── */

/** The shallowest heading level used in the body — that level numbers the sections. */
function sectionLevel(blocks: Block[]): number {
  let min = 9
  for (const b of blocks) {
    const l = headingLevel(b)
    if (l > 0 && !b[b.type]?.is_toggleable && l < min) min = l
  }
  return min === 9 ? 1 : min
}

export function renderArticle(blocks: Block[], opts: { numbered?: boolean } = {}): Rendered {
  const { body, refs } = splitReferences(blocks)
  const references = parseReferences(refs)
  const ctx: Ctx = {
    refCount: references.length,
    toc: [],
    ids: new Set(),
    level: sectionLevel(body),
    numbered: opts.numbered ?? true,
    section: 0,
    words: 0,
  }
  const html = renderList(body, ctx)
  return { html, toc: ctx.toc, references, words: ctx.words }
}

/** Plain HTML for case-study bodies — same renderer, no section numbers. */
export const renderBlocks = (blocks: Block[]) => renderArticle(blocks, { numbered: false }).html

/** Strips tags for reading-time and meta-description fallbacks. */
export const plain = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

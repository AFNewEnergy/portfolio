/**
 * A small way to write Notion pages in code.
 *
 * Every helper returns a block in the exact shape `pages.create` accepts, so
 * the sample articles are written once and used twice:
 *   · the setup route sends them to Notion as they are
 *   · the local backend converts them with `toReadShape` and renders them with
 *     the same renderer the Notion pages use — so what the site shows before
 *     Notion is connected is exactly what it shows after.
 */
type Ann = { bold?: boolean; italic?: boolean; code?: boolean; underline?: boolean }
export type Run = { type: 'text'; text: { content: string; link?: { url: string } | null }; annotations?: Ann }
type Part = string | Run
export type NBlock = Record<string, any> & { type: string }

export const txt = (content: string, annotations?: Ann): Run =>
  ({ type: 'text', text: { content }, ...(annotations ? { annotations } : {}) })
export const bold = (s: string) => txt(s, { bold: true })
export const ital = (s: string) => txt(s, { italic: true })
export const link = (s: string, url: string, annotations?: Ann): Run =>
  ({ type: 'text', text: { content: s, link: { url } }, ...(annotations ? { annotations } : {}) })

const rich = (parts: Part[]): Run[] => parts.map(p => (typeof p === 'string' ? txt(p) : p))
const block = (type: string, value: Record<string, unknown>): NBlock => ({ object: 'block', type, [type]: value })

export const h1 = (...p: Part[]) => block('heading_1', { rich_text: rich(p) })
export const h2 = (...p: Part[]) => block('heading_2', { rich_text: rich(p) })
export const h3 = (...p: Part[]) => block('heading_3', { rich_text: rich(p) })
export const para = (...p: Part[]) => block('paragraph', { rich_text: rich(p) })
export const bullet = (...p: Part[]) => block('bulleted_list_item', { rich_text: rich(p) })
export const num = (...p: Part[]) => block('numbered_list_item', { rich_text: rich(p) })
export const quote = (...p: Part[]) => block('quote', { rich_text: rich(p) })
export const divider = () => block('divider', {})

export const callout = (label: string, children: NBlock[], emoji = '💡') =>
  block('callout', { rich_text: rich([label]), icon: { type: 'emoji', emoji }, color: 'gray_background', children })

/** `src` may be a site path like /photos/x.jpg; setup turns it into a full URL. */
export const image = (src: string, caption = '') =>
  block('image', { type: 'external', external: { url: src }, caption: caption ? rich([caption]) : [] })

export const columns = (...cols: NBlock[][]) =>
  block('column_list', { children: cols.map(children => block('column', { children })) })

export const table = (rows: Part[][], opts: { header?: boolean; rowHeader?: boolean } = {}) =>
  block('table', {
    table_width: rows[0]?.length ?? 1,
    has_column_header: opts.header ?? true,
    has_row_header: opts.rowHeader ?? false,
    // An empty cell is an empty array — Notion rejects a text run with no content.
    children: rows.map(cells => block('table_row', { cells: cells.map(c => (c === '' ? [] : rich([c]))) })),
  })

export const bookmark = (url: string, caption = '') =>
  block('bookmark', { url, caption: caption ? rich([caption]) : [] })

export const toggle = (label: string, children: NBlock[]) => block('toggle', { rich_text: rich([label]), children })

/* ── create-shape → read-shape ────────────────────────────── */

const readRun = (r: Run) => ({
  ...r,
  plain_text: r.text.content,
  href: r.text.link?.url ?? null,
  annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default', ...r.annotations },
})

/**
 * Turns create-shaped blocks into the shape `blocks.children.list` returns:
 * children move out of the type object, rich text gains plain_text and href,
 * and every block gets a stable id.
 */
export function toReadShape(blocks: NBlock[], idBase: string, edited: string): any[] {
  return blocks.map((b, i) => {
    const id = `${idBase}${String(i).padStart(3, '0')}`
    const { children, ...value } = b[b.type] as Record<string, any>
    for (const k of ['rich_text', 'caption']) if (Array.isArray(value[k])) value[k] = value[k].map(readRun)
    if (b.type === 'table_row') value.cells = value.cells.map((c: Run[]) => c.map(readRun))
    const kids = Array.isArray(children) && children.length ? toReadShape(children, `${id}-`, edited) : undefined
    return { object: 'block', id, type: b.type, [b.type]: value, has_children: Boolean(kids), children: kids, last_edited_time: edited }
  })
}

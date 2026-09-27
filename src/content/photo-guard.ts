import { PERSONAL_PHOTOS, SAMPLE_ARTICLES, WRITING_GUIDE, type SampleArticle } from './samples/articles'
import { toReadShape, type NBlock } from './samples/dsl'

/**
 * Photos of Faisal are never shown inside articles.
 *
 * The first copies of the sample articles in Notion used his portraits. The
 * setup page can swap them in Notion itself, but until that is done (and in
 * case a portrait is ever pasted into an article again) the site swaps them
 * here, as it reads each article: a portrait becomes the power-sector photo in
 * the same place in the current sample, or, for any other article, one of the
 * power-sector photos in turn. His photos stay on the site's own pages only.
 */

const personal = new Set<string>(PERSONAL_PHOTOS)

export function isPersonalPhoto(url?: string | null): boolean {
  if (!url) return false
  try { return personal.has(new URL(url, 'https://site.invalid').pathname) } catch { return false }
}

const P = '/photos/insights/'
const FALLBACK = ['solar-field', 'pylons-sunset', 'solar-rows', 'power-station-substation', 'solar-meadow', 'pylons-dusk']
  .map(n => `${P}${n}.jpg`)

const sampleFor = (slug: string): SampleArticle | undefined =>
  SAMPLE_ARTICLES.find(a => a.slug === slug) ?? (slug === WRITING_GUIDE.slug ? WRITING_GUIDE : undefined)

function sampleImages(blocks: NBlock[]): NBlock[] {
  return blocks.flatMap(b => (b.type === 'image' ? [b] : b.type === 'column_list' || b.type === 'column' ? sampleImages(b[b.type].children ?? []) : []))
}

/** The cover and its caption, with a portrait swapped for a power-sector photo. */
export function guardCover(slug: string, cover: string | null, caption: string): { cover: string | null; caption: string } {
  if (!isPersonalPhoto(cover)) return { cover, caption }
  const sample = sampleFor(slug)
  if (sample && !isPersonalPhoto(sample.cover)) return { cover: sample.cover, caption: sample.coverCaption }
  return { cover: FALLBACK[slug.length % FALLBACK.length]!, caption: '' }
}

/** Article blocks as Notion returns them, with every portrait image swapped (children included). */
export function guardBlocks(slug: string, blocks: any[]): any[] {
  const sample = sampleFor(slug)
  const want = sample ? sampleImages(sample.blocks) : []
  let i = 0
  const swap = (b: any): any => {
    if (b.type === 'image') {
      const n = i++
      if (b.image?.type !== 'external' || !isPersonalPhoto(b.image.external?.url)) return b
      const same = want[n]
      const to = same && !isPersonalPhoto(same.image.external.url)
        ? toReadShape([same], `${b.id}-`, b.last_edited_time ?? '')[0].image
        : { type: 'external', external: { url: FALLBACK[n % FALLBACK.length] }, caption: [] }
      return { ...b, image: to }
    }
    return Array.isArray(b.children) ? { ...b, children: b.children.map(swap) } : b
  }
  return blocks.map(swap)
}

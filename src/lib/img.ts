/**
 * Responsive <img> attributes for three kinds of source:
 *
 *   /photos/…            files in /public — resized by Next's image optimiser
 *   /api/notion/img/…    photos uploaded into Notion — resized by our relay,
 *                        which also swaps Notion's one-hour links for fresh ones
 *   https://…            anything else — used as it is
 *
 * Returns plain attributes so the same helper works in React and in the
 * article HTML built from Notion blocks.
 */
export const RELAY = '/api/notion/img/'
export const RELAY_WIDTHS = [480, 800, 1200, 1600, 2400] as const
const NEXT_WIDTHS = [640, 828, 1080, 1200, 1920] as const

export type ImgAttrs = { src: string; srcSet?: string; sizes?: string }

export function imgAttrs(src: string, sizes: string): ImgAttrs {
  if (src.startsWith(RELAY)) {
    return {
      src: `${src}/1200`,
      srcSet: RELAY_WIDTHS.map(w => `${src}/${w} ${w}w`).join(', '),
      sizes,
    }
  }
  if (src.startsWith('/') && !src.startsWith('//')) {
    const at = (w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`
    return { src: at(1200), srcSet: NEXT_WIDTHS.map(w => `${at(w)} ${w}w`).join(', '), sizes }
  }
  return { src }
}

/** Same thing as an HTML attribute string, for server-built markup. */
export function imgAttrString(src: string, sizes: string): string {
  const a = imgAttrs(src, sizes)
  const q = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  return `src="${q(a.src)}"${a.srcSet ? ` srcset="${q(a.srcSet)}" sizes="${q(a.sizes!)}"` : ''}`
}

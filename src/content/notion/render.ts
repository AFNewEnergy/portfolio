/**
 * Notion blocks → HTML.
 *
 * Written by hand rather than pulling in notion-to-md: those packages lag
 * behind Notion's API versions and break on upgrade. This is ~80 lines we own.
 */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function inline(rt: any[] = []): string {
  return rt
    .map(t => {
      let s = esc(t.plain_text)
      const a = t.annotations ?? {}
      if (a.code) s = `<code>${s}</code>`
      if (a.bold) s = `<strong>${s}</strong>`
      if (a.italic) s = `<em>${s}</em>`
      if (a.strikethrough) s = `<s>${s}</s>`
      if (t.href) s = `<a href="${t.href}" rel="noopener nofollow">${s}</a>`
      return s
    })
    .join('')
}

export function renderBlocks(blocks: any[]): string {
  let html = ''
  let list: 'ul' | 'ol' | null = null
  const close = () => { if (list) { html += `</${list}>`; list = null } }
  const open = (k: 'ul' | 'ol') => { if (list !== k) { close(); html += `<${k}>`; list = k } }

  for (const b of blocks) {
    const v = b[b.type]
    switch (b.type) {
      case 'paragraph': close(); if (inline(v.rich_text)) html += `<p>${inline(v.rich_text)}</p>`; break
      case 'heading_1': close(); html += `<h2>${inline(v.rich_text)}</h2>`; break
      case 'heading_2': close(); html += `<h3>${inline(v.rich_text)}</h3>`; break
      case 'heading_3': close(); html += `<h4>${inline(v.rich_text)}</h4>`; break
      case 'bulleted_list_item': open('ul'); html += `<li>${inline(v.rich_text)}${b.children ? renderBlocks(b.children) : ''}</li>`; break
      case 'numbered_list_item': open('ol'); html += `<li>${inline(v.rich_text)}${b.children ? renderBlocks(b.children) : ''}</li>`; break
      case 'quote': close(); html += `<blockquote>${inline(v.rich_text)}</blockquote>`; break
      case 'callout': close(); html += `<aside class="callout">${v.icon?.emoji ?? ''}<div>${inline(v.rich_text)}</div></aside>`; break
      case 'code': close(); html += `<pre><code>${esc(inline(v.rich_text))}</code></pre>`; break
      case 'divider': close(); html += '<hr>'; break
      case 'toggle': close(); html += `<details><summary>${inline(v.rich_text)}</summary>${b.children ? renderBlocks(b.children) : ''}</details>`; break
      case 'image': {
        close()
        // Prefer external URLs: Notion-hosted file URLs expire after ~1 hour.
        const src = v.type === 'external' ? v.external?.url : v.file?.url
        const cap = inline(v.caption)
        if (src) html += `<figure><img src="${src}" alt="${esc(cap)}" loading="lazy" decoding="async">${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`
        break
      }
      case 'video': case 'embed': case 'bookmark': {
        close()
        const src = v.url ?? v.external?.url
        if (src) html += `<div class="embed" data-src="${esc(src)}"></div>`
        break
      }
      case 'column_list': case 'column': case 'table':
        close(); if (b.children) html += renderBlocks(b.children); break
      default:
        close()  // unknown future block types are skipped, never fatal
    }
  }
  close()
  return html
}

/** Strips tags for reading-time and meta-description fallbacks. */
export const plain = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

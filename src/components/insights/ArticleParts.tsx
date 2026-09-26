'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Icon } from '@/components/primitives/Icon'
import { imgAttrs } from '@/lib/img'
import { cn } from '@/lib/cn'
import type { Reference, TocItem } from '@/content/types'

/* ── copy to clipboard, with a fallback for older browsers ── */

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    el.remove()
    return ok
  }
}

function useFlash(): [string, (key: string) => void] {
  const [on, setOn] = useState('')
  useEffect(() => {
    if (!on) return
    const id = setTimeout(() => setOn(''), 1800)
    return () => clearTimeout(id)
  }, [on])
  return [on, setOn]
}

/* ── "On this page" ───────────────────────────────────────── */

/** Highlights the section being read. The same list renders as a sticky side
 *  column on wide screens and as a fold-out box above the text on phones. */
export function ArticleToc({ items, meta, variant }: { items: TocItem[]; meta?: string; variant: 'side' | 'fold' }) {
  const t = useTranslations('insights.article')
  const [active, setActive] = useState(items[0]?.id ?? '')

  useEffect(() => {
    if (variant !== 'side') return
    const els = items.map(i => document.getElementById(i.id)).filter((e): e is HTMLElement => Boolean(e))
    if (!els.length) return
    const onScroll = () => {
      const line = window.innerHeight * 0.28
      let current = els[0]!.id
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [items, variant])

  const list = (
    <ol className="toc-list">
      {items.map(i => (
        <li key={i.id}>
          <a href={`#${i.id}`} className={cn(variant === 'side' && active === i.id && 'is-on')}
            aria-current={variant === 'side' && active === i.id ? 'location' : undefined}>
            <span className="toc-n t-mono">{i.n}</span><span>{i.label}</span>
          </a>
        </li>
      ))}
    </ol>
  )

  if (variant === 'fold') {
    return (
      <details className="toc-fold">
        <summary><span className="t-mono">{t('onThisPage')}</span><span className="toc-count t-mono">{items.length}</span></summary>
        {list}
      </details>
    )
  }
  return (
    <nav className="toc-side" aria-label={t('onThisPage')}>
      <span className="t-mono toc-head">{t('onThisPage')}</span>
      {list}
      {meta && <p className="t-mono toc-meta">{meta}</p>}
    </nav>
  )
}

/* ── share bar ────────────────────────────────────────────── */

export function ShareBar({ url, title, notionUrl }: { url: string; title: string; notionUrl: string | null }) {
  const t = useTranslations('insights.article')
  const [flash, setFlash] = useFlash()
  const u = encodeURIComponent(url)
  const networks = [
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
    { name: 'X', href: `https://x.com/intent/post?url=${u}&text=${encodeURIComponent(title)}` },
  ]
  return (
    <div className="share-bar">
      {notionUrl && (
        <a href={notionUrl} target="_blank" rel="noopener noreferrer" className="btn btn--ghost share-notion">
          <Icon name="external" /><span>{t('readOnNotion')}</span>
        </a>
      )}
      <button type="button" className="share" onClick={async () => { if (await copy(url)) setFlash('link') }}>
        <Icon name="link" /><span aria-live="polite">{flash === 'link' ? t('linkCopied') : t('copyLink')}</span>
      </button>
      {networks.map(n => (
        <a key={n.name} href={n.href} target="_blank" rel="noopener noreferrer" className="share"
          aria-label={t('shareOn', { network: n.name })}>
          {n.name}
        </a>
      ))}
    </div>
  )
}

/* ── references + citation ────────────────────────────────── */

export function ReferenceTabs({ refs, citation }: { refs: Reference[]; citation: string }) {
  const t = useTranslations('insights.article')
  const [tab, setTab] = useState<'refs' | 'cite'>('refs')
  const [flash, setFlash] = useFlash()

  // A [n] link in the text opens the References tab and brings the entry into view —
  // also when the Cite tab was showing, or the same [n] is clicked twice.
  useEffect(() => {
    const reveal = (hash: string) => {
      if (!/^#ref-\d+$/.test(hash)) return
      setTab('refs')
      requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'center' }))
    }
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a.cite') as HTMLAnchorElement | null
      if (a) reveal(a.hash)
    }
    const onHash = () => reveal(window.location.hash)
    onHash()
    document.addEventListener('click', onClick)
    window.addEventListener('hashchange', onHash)
    return () => { document.removeEventListener('click', onClick); window.removeEventListener('hashchange', onHash) }
  }, [])

  return (
    <section id="references" className="refs" aria-label={t('references')}>
      <div className="refs-tabs" role="tablist">
        <button type="button" role="tab" id="tab-refs" aria-controls="panel-refs" aria-selected={tab === 'refs'}
          className={cn('refs-tab', tab === 'refs' && 'is-on')} onClick={() => setTab('refs')}>
          {t('referencesCount', { count: refs.length })}
        </button>
        <button type="button" role="tab" id="tab-cite" aria-controls="panel-cite" aria-selected={tab === 'cite'}
          className={cn('refs-tab', tab === 'cite' && 'is-on')} onClick={() => setTab('cite')}>
          {t('cite')}
        </button>
      </div>
      <div className="refs-panel">
        <ol id="panel-refs" role="tabpanel" aria-labelledby="tab-refs" hidden={tab !== 'refs'} className="refs-list">
          {refs.map(r => {
            const inner = (
              <>
                <span className="ref-n t-mono">[{r.n}]</span>
                <span className="ref-text">
                  <span className="ref-title">{r.title}</span>
                  {r.source && <span className="ref-source">{r.source}</span>}
                </span>
                {r.url && <span className="ref-go" aria-hidden="true"><Icon name="external" /></span>}
              </>
            )
            return (
              <li key={r.n} id={`ref-${r.n}`}>
                {r.url
                  ? <a className="ref" href={r.url} target="_blank" rel="noopener noreferrer">{inner}</a>
                  : <div className="ref">{inner}</div>}
              </li>
            )
          })}
        </ol>
        <div id="panel-cite" role="tabpanel" aria-labelledby="tab-cite" hidden={tab !== 'cite'} className="cite-panel">
          <p className="cite-text">{citation}</p>
          <button type="button" className="share" onClick={async () => { if (await copy(citation)) setFlash('cite') }}>
            <Icon name="copy" /><span aria-live="polite">{flash === 'cite' ? t('citationCopied') : t('copyCitation')}</span>
          </button>
        </div>
      </div>
    </section>
  )
}

/* ── video: nothing third-party loads until the visitor presses play ── */

export function VideoFacade({ embed, cover, title }: { embed: string; cover: string | null; title: string }) {
  const t = useTranslations('insights')
  const [on, setOn] = useState(false)
  if (on) {
    return (
      <div className="video">
        <iframe src={`${embed}${embed.includes('?') ? '&' : '?'}autoplay=1`} title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
      </div>
    )
  }
  return (
    <button type="button" className="video video-facade" onClick={() => setOn(true)}>
      {cover && <img {...imgAttrs(cover, '(max-width: 1080px) 92vw, 1200px')} alt="" />}
      <span className="video-play"><Icon name="play" strokeWidth={0} fill="currentColor" /><span>{t('playVideo')}</span></span>
    </button>
  )
}

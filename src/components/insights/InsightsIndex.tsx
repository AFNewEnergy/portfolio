'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Icon } from '@/components/primitives/Icon'
import { imgAttrs } from '@/lib/img'
import { cn } from '@/lib/cn'

/** Everything a card needs, already formatted on the server. */
export type Card = {
  slug: string
  title: string
  excerpt: string
  topic: string | null
  video: boolean
  cover: string | null
  date: string
  len: string
}

type View = 'grid' | 'list'
const PER: Record<View, number> = { grid: 3, list: 5 }
const VIEW_KEY = 'insights-view'

/** 1 … 4 5 6 … 12 once there are more than seven pages. */
function pageList(count: number, current: number): Array<number | 'gap'> {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)
  const keep = [...new Set([1, count, current - 1, current, current + 1])].filter(n => n >= 1 && n <= count).sort((a, b) => a - b)
  const out: Array<number | 'gap'> = []
  keep.forEach((n, i) => {
    const prev = keep[i - 1]
    if (i > 0 && prev !== undefined && n - prev > 1) out.push('gap')
    out.push(n)
  })
  return out
}

function Media({ card, ratio, sizes, eager }: { card: Card; ratio: string; sizes: string; eager?: boolean }) {
  return (
    <div className="ins-media" style={{ aspectRatio: ratio }}>
      {card.cover
        ? <img {...imgAttrs(card.cover, sizes)} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" />
        : <span className="ins-media-blank" aria-hidden="true"><span className="t-mono">{card.topic}</span></span>}
      {card.video && <span className="ins-badge t-mono"><Icon name="play" strokeWidth={0} fill="currentColor" />Video</span>}
    </div>
  )
}

export function InsightsIndex({ cards, author }: { cards: Card[]; author: { name: string; photo: string } }) {
  const t = useTranslations('insights')
  const [view, setView] = useState<View>('grid')
  const [page, setPage] = useState(1)
  const [all, setAll] = useState(false)
  const ready = useRef(false)
  const top = useRef<HTMLDivElement>(null)

  // Restore state from the address (?view=list&page=2 or ?all=1), else the last view used.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    let v = q.get('view')
    // A shared ?page= link without a view was made in the grid (the default), so it opens in the grid for everyone.
    if (v !== 'grid' && v !== 'list' && (q.has('page') || q.has('all'))) v = 'grid'
    if (v !== 'grid' && v !== 'list') {
      try { v = localStorage.getItem(VIEW_KEY) } catch { v = null }
    }
    if (v === 'grid' || v === 'list') setView(v)
    const p = Number(q.get('page'))
    if (Number.isInteger(p) && p > 1) setPage(p)
    if (q.get('all') === '1') setAll(true)
    ready.current = true
  }, [])

  const total = cards.length
  const per = PER[view]
  const pageCount = Math.max(1, Math.ceil(total / per))
  const current = Math.min(page, pageCount)
  const start = all ? 0 : (current - 1) * per
  const end = all ? total : Math.min(total, start + per)
  const items = cards.slice(start, end)
  const featured = view === 'grid' && (all || current === 1) ? items[0] : undefined
  const rest = featured ? items.slice(1) : items

  // Keep the address in step so a page can be shared or bookmarked.
  useEffect(() => {
    if (!ready.current) return
    const q = new URLSearchParams(window.location.search)
    q.delete('view'); q.delete('page'); q.delete('all')
    if (view !== 'grid') q.set('view', view)
    if (all) q.set('all', '1')
    else if (current > 1) q.set('page', String(current))
    const s = q.toString()
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${s ? `?${s}` : ''}`)
    try { localStorage.setItem(VIEW_KEY, view) } catch { /* private mode */ }
  }, [view, current, all])

  function go(next: { view?: View; page?: number; all?: boolean }) {
    if (next.view) setView(next.view)
    if (next.page !== undefined) setPage(next.page)
    if (next.all !== undefined) setAll(next.all)
    const el = top.current
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start' })
  }

  // Real links, so search engines can follow the pages; a click is handled here without a reload.
  const pageHref = (n: number) => {
    const q = new URLSearchParams()
    if (view !== 'grid') q.set('view', view)
    if (n > 1) q.set('page', String(n))
    const s = q.toString()
    return s ? `?${s}` : '?'
  }
  const follow = (n: number) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    go({ page: n })
  }

  const range = all
    ? t('showingAll', { total })
    : end - start === 1 ? t('showingOne', { n: end, total }) : t('showing', { from: start + 1, to: end, total })

  return (
    <div ref={top} className="ins-index">
      <div className="ins-toolbar">
        <span className="t-mono ins-range" aria-live="polite">{range}</span>
        <div className="ins-tools">
          <div className="seg" role="group" aria-label={t('view.label')}>
            <button type="button" className={cn('seg-btn', view === 'grid' && 'is-on')} aria-pressed={view === 'grid'}
              onClick={() => go({ view: 'grid', page: 1 })}>
              <Icon name="grid" /><span>{t('view.grid')}</span>
            </button>
            <button type="button" className={cn('seg-btn', view === 'list' && 'is-on')} aria-pressed={view === 'list'}
              onClick={() => go({ view: 'list', page: 1 })}>
              <Icon name="list" /><span>{t('view.list')}</span>
            </button>
          </div>
          <button type="button" className={cn('all-btn', all && 'is-on')} aria-pressed={all}
            onClick={() => go({ all: !all, page: 1 })}>
            {t('all')}
          </button>
        </div>
      </div>

      <div key={`${view}-${current}-${all}`} className="ins-body">
        {view === 'grid' ? (
          <>
            {featured && (
              <Link href={`/insights/${featured.slug}`} className="ins-feature">
                <Media card={featured} ratio="16 / 10" sizes="(max-width: 960px) 92vw, 720px" eager />
                <div className="ins-feature-text">
                  <div className="ins-kicker t-mono">
                    {featured.topic && <span className="ins-topic">{featured.topic}</span>}
                    <span>{t('latest')}</span>
                  </div>
                  <h2 className="ins-feature-title" dir="auto">{featured.title}</h2>
                  {featured.excerpt && <p className="ins-excerpt" dir="auto">{featured.excerpt}</p>}
                  <div className="ins-byline">
                    <img {...imgAttrs(author.photo, '48px')} alt="" className="ins-avatar" loading="lazy" />
                    <span className="ins-byline-who">
                      <span>{author.name}</span>
                      <span className="t-mono">{[featured.date, featured.len].filter(Boolean).join(' · ')}</span>
                    </span>
                    <span className="ins-cta">
                      {featured.video ? t('watchVideo') : t('readArticle')}
                      <Icon name="arrow" strokeWidth={1.6} />
                    </span>
                  </div>
                </div>
              </Link>
            )}
            {rest.length > 0 && (
              <div className="ins-grid">
                {rest.map(c => (
                  <Link key={c.slug} href={`/insights/${c.slug}`} className="ins-card">
                    <Media card={c} ratio="3 / 2" sizes="(max-width: 720px) 92vw, (max-width: 1080px) 46vw, 400px" />
                    {c.topic && <span className="ins-topic t-mono">{c.topic}</span>}
                    <h3 className="ins-card-title" dir="auto">{c.title}</h3>
                    {c.excerpt && <p className="ins-excerpt" dir="auto">{c.excerpt}</p>}
                    <span className="ins-meta t-mono">{[c.date, c.len].filter(Boolean).join(' · ')}</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="ins-list">
            {items.map(c => (
              <Link key={c.slug} href={`/insights/${c.slug}`} className="ins-row">
                <Media card={c} ratio="3 / 2" sizes="(max-width: 720px) 34vw, 220px" />
                <div className="ins-row-text">
                  {c.topic && <span className="ins-topic t-mono">{c.topic}</span>}
                  <h3 className="ins-card-title" dir="auto">{c.title}</h3>
                  {c.excerpt && <p className="ins-excerpt" dir="auto">{c.excerpt}</p>}
                  <span className="ins-meta ins-meta--inline t-mono">{[c.date, c.len].filter(Boolean).join(' · ')}</span>
                </div>
                <div className="ins-row-meta t-mono"><span>{c.date}</span><span>{c.len}</span></div>
                <span className="ins-go" aria-hidden="true"><Icon name="arrow" strokeWidth={1.6} /></span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {!all && pageCount > 1 && (
        <nav className="ins-pager" aria-label={t('pagesLabel')}>
          {current <= 1
            ? <button type="button" className="pg-step" disabled><Icon name="arrow" strokeWidth={1.6} className="flip" /><span>{t('prev')}</span></button>
            : <a href={pageHref(current - 1)} rel="prev" className="pg-step" onClick={follow(current - 1)}><Icon name="arrow" strokeWidth={1.6} className="flip" /><span>{t('prev')}</span></a>}
          <div className="pg-nums">
            {pageList(pageCount, current).map((n, i) => n === 'gap'
              ? <span key={`g${i}`} className="pg-gap" aria-hidden="true">…</span>
              : (
                <a key={n} href={pageHref(n)} className={cn('pg', n === current && 'is-on')}
                  aria-label={t('pageN', { n })} aria-current={n === current ? 'page' : undefined}
                  onClick={follow(n)}>
                  {n}
                </a>
              ))}
            <span className="t-mono pg-of">{t('pageOf', { page: current, count: pageCount })}</span>
          </div>
          {current >= pageCount
            ? <button type="button" className="pg-step" disabled><span>{t('next')}</span><Icon name="arrow" strokeWidth={1.6} /></button>
            : <a href={pageHref(current + 1)} rel="next" className="pg-step" onClick={follow(current + 1)}><span>{t('next')}</span><Icon name="arrow" strokeWidth={1.6} /></a>}
        </nav>
      )}
      {/* Without JavaScript the pager cannot work, so list every article plainly. */}
      <noscript>
        <ul className="ins-noscript">
          {cards.map(c => <li key={c.slug}><Link href={`/insights/${c.slug}`}>{c.title}</Link> <span className="t-mono">{c.date}</span></li>)}
        </ul>
      </noscript>
      {all && total > 0 && (
        <div className="ins-allfoot">
          <span className="t-mono">{t('allShown', { total })}</span>
          <button type="button" className="pg-step" onClick={() => go({ all: false, page: 1 })}>{t('backToPages')}</button>
        </div>
      )}
    </div>
  )
}

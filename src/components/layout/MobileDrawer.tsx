'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { NAV, NAV_PATH, LOCALES, LOCALE_NAMES, site, type Locale } from '@/config/site'
import { Icon, Sigil } from '@/components/primitives/Icon'
import { cn } from '@/lib/cn'

export function MobileDrawer() {
  const t = useTranslations()
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  /**
   * The panel is portalled to <body>.
   *
   * .site-header carries `backdrop-filter`, and any non-`none` filter makes an
   * element the containing block for its fixed-position descendants — so a
   * drawer rendered inside the header resolves `position: fixed; inset: 0`
   * against the 68px header strip instead of the viewport, and its z-index is
   * trapped inside the header's stacking context. The panel opened into a
   * sliver behind the hero. Rendering it at <body> restores both.
   */
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  const panel = (
    <div className="drawer" data-open={open} aria-hidden={!open}>
      <div className="flex h-[clamp(48px,6vh,62px)] items-center justify-between">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <Sigil />
          <span className="brand-name">{site.shortName}</span>
        </Link>
        <button className="icon-btn" onClick={() => setOpen(false)} aria-label={t('ui.closeMenu')}>
          <Icon name="close" />
        </button>
      </div>

      <nav className="mt-[clamp(20px,5vh,48px)] border-t border-[var(--line)]">
        {NAV.map((key, i) => (
          <Link key={key} href={NAV_PATH[key]} className="drawer-link" onClick={() => setOpen(false)}
            aria-current={isActive(NAV_PATH[key]) ? 'page' : undefined}>
            <span className="t-mono" style={{ color: 'var(--ink-3)' }}>{String(i + 1).padStart(2, '0')}</span>
            {t(`nav.${key}`)}
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-4 pt-7">
        <span className="t-mono" style={{ color: 'var(--ink-3)' }}>{t('ui.language')}</span>
        <div className="flex flex-wrap gap-1.5">
          {LOCALES.map(l => (
            <button key={l} aria-current={l === locale}
              onClick={() => { setOpen(false); router.replace(pathname, { locale: l }) }}
              className={cn('t-mono border px-3 py-2 transition-colors',
                l === locale
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]'
                  : 'border-[var(--line-strong)] text-[var(--ink-2)]')}>
              {LOCALE_NAMES[l]}
            </button>
          ))}
        </div>
        <Link href="/contact" className="btn btn--primary mt-1.5 justify-center" onClick={() => setOpen(false)}>
          {t('ui.getInTouch')}
        </Link>
      </div>
    </div>
  )

  return (
    <>
      <button className="icon-btn lg:hidden" onClick={() => setOpen(true)} aria-label={t('ui.openMenu')}>
        <Icon name="menu" />
      </button>
      {mounted && createPortal(panel, document.body)}
    </>
  )
}

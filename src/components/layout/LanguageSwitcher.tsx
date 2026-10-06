'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { LOCALES, LOCALE_NAMES, type Locale } from '@/config/site'
import { Icon } from '@/components/primitives/Icon'

/**
 * Switches locale and stays on the same route, dynamic segments included.
 * `placement="up"` opens the menu above the button (used in the footer, where
 * there is no room below) and adds a chevron that shows which way it opens.
 */
export function LanguageSwitcher({ placement = 'down' }: { placement?: 'down' | 'up' }) {
  const up = placement === 'up'
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  function pick(next: Locale) {
    setOpen(false)
    if (next !== locale) start(() => router.replace(pathname, { locale: next }))
  }

  return (
    <div className={up ? 'lang-switch lang-switch--up relative' : 'relative'} ref={box}>
      <button className="pill-btn" onClick={() => setOpen(o => !o)}
        aria-expanded={open} aria-haspopup="listbox" disabled={pending}>
        <Icon name="globe" strokeWidth={1.3} />
        <span>{LOCALE_NAMES[locale]}</span>
        {up && <Icon name="chevronUp" strokeWidth={1.6} className="lang-chev" />}
      </button>

      {open && (
        <div className={up ? 'menu-pop menu-pop--up' : 'menu-pop'} role="listbox">
          {LOCALES.map(l => (
            <button key={l} role="option" aria-selected={l === locale} aria-current={l === locale}
              className="menu-item" onClick={() => pick(l)}>
              {LOCALE_NAMES[l]}
              <span className="t-mono" style={{ color: 'var(--ink-3)' }}>{l}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

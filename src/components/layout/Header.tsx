'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { NAV, NAV_PATH, site } from '@/config/site'
import { Sigil } from '@/components/primitives/Icon'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { MobileDrawer } from './MobileDrawer'

/**
 * Sticky rather than fixed — it participates in layout, so no page needs a
 * magic top-padding value to clear it.
 */
export function Header() {
  const t = useTranslations()
  const pathname = usePathname()
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <header className="site-header">
      <div className="site-nav">
        <Link href="/" className="brand">
          <Sigil />
          <span>
            <span className="brand-name">{site.shortName}</span>
            <span className="brand-role t-mono">{t('ui.tagline')}</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label={t('ui.mainNav')}>
          {NAV.map(key => (
            <Link key={key} href={NAV_PATH[key]} className="nav-link"
              aria-current={isActive(NAV_PATH[key]) ? 'page' : undefined}>
              {t(`nav.${key}`)}
            </Link>
          ))}
        </nav>

        <div className="flex flex-none items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          <Link href="/contact" className="pill-cta max-[520px]:hidden">{t('ui.getInTouch')}</Link>
          <MobileDrawer />
        </div>
      </div>
    </header>
  )
}

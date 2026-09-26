import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { NAV, NAV_PATH, LOCALES, LOCALE_NAMES, site, type Locale } from '@/config/site'
import { TECHNOLOGIES } from '@/content/types'
import { Sigil, SocialIcon, Icon } from '@/components/primitives/Icon'
import { socialLinks } from '@/lib/social'

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale })

  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-grid">
          <div>
            <div className="brand mb-[18px]">
              <Sigil />
              <span>
                <span className="brand-name">{site.name}</span>
                <span className="brand-role t-mono">{site.company.name}</span>
              </span>
            </div>
            <p className="max-w-[30ch]">{t('footer.blurb')}</p>
            <div className="social-row">
              {socialLinks().map(s => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer me" aria-label={s.label}>
                  <SocialIcon name={s.name} />
                </a>
              ))}
              <a href={`mailto:${site.email}`} aria-label="Email"><Icon name="mail" /></a>
            </div>
          </div>

          <nav aria-label={t('footer.pages')}>
            <h2 className="t-mono footer-h">{t('footer.pages')}</h2>
            {NAV.map(k => <Link key={k} href={NAV_PATH[k]}>{t(`nav.${k}`)}</Link>)}
          </nav>

          <nav aria-label={t('footer.technologies')}>
            <h2 className="t-mono footer-h">{t('footer.technologies')}</h2>
            {TECHNOLOGIES.slice(0, 5).map(x => <Link key={x} href="/projects">{t(`tech.${x}`)}</Link>)}
          </nav>

          <div>
            <h2 className="t-mono footer-h">{t('footer.contact')}</h2>
            <p>{t('contact.locationValue')}</p>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <a href={`tel:${site.phone}`} className="t-num">{site.phoneDisplay}</a>
          </div>
        </div>

        <div className="wordmark" aria-hidden="true">{site.nickname.toUpperCase()}</div>

        <div className="footer-bottom t-mono">
          <span>© {new Date().getFullYear()} {site.name} · {site.company.name}</span>
          <a href={site.company.url} className="footer-domain">{site.company.domain}</a>
          <span>{LOCALES.map(l => LOCALE_NAMES[l]).join(' · ')}</span>
        </div>
      </div>
    </footer>
  )
}

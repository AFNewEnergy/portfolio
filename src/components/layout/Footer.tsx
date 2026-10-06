import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { NAV, NAV_PATH, EMAILS, site, type Locale } from '@/config/site'
import { TECHNOLOGIES } from '@/content/types'
import { Sigil, SocialIcon, Icon } from '@/components/primitives/Icon'
import { socialLinks } from '@/lib/social'
import { LanguageSwitcher } from './LanguageSwitcher'

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
            {EMAILS.map(e => <a key={e} href={`mailto:${e}`}>{e}</a>)}
            {/* Two numbers with two jobs: one for calls, one for WhatsApp messages. */}
            <a href={`tel:${site.phone}`} className="footer-num">
              <span className="t-num">{site.phoneDisplay}</span>
              <span className="footer-num-tag t-mono">{t('contact.callShort')}</span>
            </a>
            <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="footer-num">
              <span className="t-num">{site.whatsappDisplay}</span>
              <span className="footer-num-tag t-mono">{t('contact.whatsappShort')}</span>
            </a>
          </div>
        </div>

        {/* Outline title in the footer. Decorative: the same words are in the page metadata. */}
        <div className="wordmark" aria-hidden="true">{site.jobTitle}</div>

        {/* Bottom row: rights line on the left; legal link, domain, language menu and
            back-to-top on the right. The rights line and legal link are English on
            every language version, like the Copyright & disclaimer page itself. */}
        <div className="footer-bottom">
          <span className="footer-copy t-mono" lang="en" dir="ltr">
            © {new Date().getFullYear()} {site.name} · {site.company.name}. All rights reserved.
          </span>
          <div className="footer-meta">
            <span className="footer-links">
              <Link href="/copyright" className="footer-link" lang="en" dir="ltr">Copyright &amp; disclaimer</Link>
              <span className="footer-sep" aria-hidden="true" />
              <a href={site.company.url} className="footer-link">{site.company.domain}</a>
            </span>
            <span className="footer-sep" aria-hidden="true" />
            <LanguageSwitcher placement="up" />
            <a href="#top" className="footer-top" aria-label={t('ui.backToTop')} title={t('ui.backToTop')}>
              <Icon name="arrowUp" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { site, type Locale } from '@/config/site'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbSchema } from '@/lib/jsonld'
import { socialLinks } from '@/lib/social'
import { PageTop } from '@/components/sections/SectionHead'
import { ContactForm } from '@/components/sections/ContactForm'
import { Reveal } from '@/components/primitives/Reveal'
import { Icon, SocialIcon, type IconName } from '@/components/primitives/Icon'
import { JsonLd } from '@/components/seo/JsonLd'
import { Figure } from '@/components/primitives/Figure'

export const revalidate = 3600
type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.contact' })
  return buildMetadata({ locale, path: '/contact', title: t('title'), description: t('description') })
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'contact' })
  const tn = await getTranslations({ locale, namespace: 'nav' })

  const rows: Array<{ icon: IconName; label: string; value: string; href?: string }> = [
    { icon: 'mail', label: t('emailLabel'), value: site.email, href: `mailto:${site.email}` },
    { icon: 'phone', label: t('phoneLabel'), value: site.whatsappDisplay, href: `https://wa.me/${site.whatsapp}` },
    { icon: 'pin', label: t('locationLabel'), value: t('locationValue') },
    { icon: 'clock', label: t('hoursLabel'), value: site.consultationHours },
    { icon: 'clock2', label: t('responseLabel'), value: t('responseValue') },
  ]

  return (
    <>
      <PageTop title={t.rich('title', { em: c => <em>{c}</em> })} lede={t('lede')} />
      <section className="section">
        <div className="shell grid items-start gap-[clamp(28px,5vw,72px)] max-[960px]:grid-cols-1 lg:grid-cols-[0.42fr_0.58fr]">
          <div>
            <Figure
              photo={site.photos.contact}
              alt={`${site.name} — ${site.jobTitle}`}
              caption={[site.location.city, site.location.timezone]}
              className="mb-8"
              sizes="(max-width: 960px) 92vw, 420px"
            />
            {rows.map(r => {
              const body = (
                <>
                  <Icon name={r.icon} className="mt-1 h-[18px] w-[18px] flex-none" style={{ color: 'var(--accent)' }} />
                  <div>
                    <span className="fact-key t-mono">{r.label}</span>
                    <span className="fact-value">{r.value}</span>
                  </div>
                </>
              )
              const cls = 'flex items-start gap-3.5 border-b border-[var(--line)] py-4'
              return r.href
                ? <a key={r.label} href={r.href} className={`${cls} transition-colors hover:text-[var(--accent)]`}>{body}</a>
                : <div key={r.label} className={cls}>{body}</div>
            })}
            <div className="social-row">
              {socialLinks().map(s => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer me" aria-label={s.label}>
                  <SocialIcon name={s.name} />
                </a>
              ))}
            </div>
          </div>

          <Reveal delay={80}><ContactForm /></Reveal>
        </div>
      </section>
      <JsonLd data={breadcrumbSchema(locale, [
        { name: tn('home'), path: '/' },
        { name: tn('contact'), path: '/contact' },
      ])} />
    </>
  )
}

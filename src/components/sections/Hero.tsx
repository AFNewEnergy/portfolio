import { getTranslations } from 'next-intl/server'
import { site, type Locale } from '@/config/site'
import { Reveal } from '@/components/primitives/Reveal'
import { Rail } from '@/components/primitives/Rail'
import { Button } from '@/components/primitives/Button'
import { Icon } from '@/components/primitives/Icon'
import { Figure } from '@/components/primitives/Figure'

export async function Hero({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'home.hero' })
  const c = await getTranslations({ locale, namespace: 'contact' })

  return (
    <div className="hero">
      {/* Decorative 12-column rule grid — the institutional cue. */}
      <div className="hero-grid" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => <span key={i} />)}
      </div>

      <div className="shell hero-body">
        <div>
          <Reveal><Rail>{t('eyebrow')}</Rail></Reveal>

          {/* Line breaks and the italic phrase are translator-controlled, so
              every language sets its own rhythm rather than inheriting English's. */}
          <Reveal as="h1" className="t-hero mt-7" delay={40}>
            {t.rich('title', { br: () => <br />, em: ch => <em>{ch}</em> })}
          </Reveal>

          <Reveal as="p" className="t-lede mt-7" delay={80}>{t('lede')}</Reveal>

          <Reveal className="btn-row mt-9" delay={120}>
            <Button href="/contact" icon="arrow">{t('ctaPrimary')}</Button>
            <Button href="/projects" variant="ghost" icon="register">{t('ctaSecondary')}</Button>
          </Reveal>

          <Reveal className="mt-7" delay={160}>
            <span className="availability"><i aria-hidden="true" />{t('availability')}</span>
          </Reveal>
        </div>

        {/* Right column: portrait plate, then the practical details a foreign
            client checks first — where he is, and when he is reachable. */}
        <div className="hero-aside">
          <Figure
            photo={site.photos.hero}
            alt={`${site.name} — ${site.jobTitle}`}
            caption={[`ABH — ${site.nickname}`, `${site.location.city} / ${site.location.countryCode}`]}
            ratio="portrait"
            priority
            sizes="(max-width: 960px) 45vw, 380px"
            className="portrait"
            delay={100}
          />

          <Reveal className="hero-facts" delay={140}>
            <div className="hero-fact">
              <Icon name="clock" className="hero-fact-icon" />
              <div>
                <span className="fact-key t-mono">{c('hoursLabel')}</span>
                <span className="fact-value">{site.consultationHours}</span>
              </div>
            </div>
            <div className="hero-fact">
              <Icon name="clock2" className="hero-fact-icon" />
              <div>
                <span className="fact-key t-mono">{c('responseLabel')}</span>
                <span className="fact-value">{c('responseValue')}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  )
}

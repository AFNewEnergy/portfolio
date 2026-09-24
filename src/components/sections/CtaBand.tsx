import { getTranslations } from 'next-intl/server'
import { site, type Locale } from '@/config/site'
import { Reveal } from '@/components/primitives/Reveal'
import { Rail } from '@/components/primitives/Rail'
import { Button } from '@/components/primitives/Button'

export async function CtaBand({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'cta' })

  return (
    <div className="cta-band">
      <div className="shell cta-body">
        <div>
          <Reveal><Rail>{t('eyebrow')}</Rail></Reveal>
          <Reveal as="h2" className="t-title mt-[22px] max-w-[24ch]" delay={40}>
            {t.rich('title', { em: c => <em>{c}</em> })}
          </Reveal>
          <Reveal delay={80}>
            <a href={`mailto:${site.email}`} className="cta-mail mt-5">{site.email}</a>
          </Reveal>
        </div>
        <Reveal className="btn-row" delay={120}>
          <Button href="/contact" icon="arrow">{t('primary')}</Button>
          <Button href={`https://wa.me/${site.whatsapp}`} external variant="ghost" icon="phone">
            {t('secondary')}
          </Button>
        </Reveal>
      </div>
    </div>
  )
}

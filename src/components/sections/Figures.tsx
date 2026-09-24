import { getTranslations } from 'next-intl/server'
import { site, type Locale } from '@/config/site'
import { Reveal } from '@/components/primitives/Reveal'

/**
 * The statistics strip. Values come from site.config so they are confirmed in
 * one place; labels and notes come from the message files so they translate.
 *
 * Slot 2 is deliberately the 1,500 MW proposals figure rather than the 20 GW+
 * aggregate. It is quoted verbatim from the CV — "authored winning proposals
 * and tender documents for over 1,500 MW of solar projects" — so it is precise
 * and defensible in a meeting. `site.stats.capacityGW` is still in config if
 * the aggregate is wanted back, but it needs a qualifier to be honest.
 */
const FIGURES = [
  { key: 'years', value: () => String(site.stats.years), unit: 'YRS' },
  { key: 'proposals', value: () => site.stats.proposalsMW.toLocaleString('en-US'), unit: 'MW+' },
  { key: 'projects', value: () => String(site.stats.projects), unit: '+' },
  { key: 'partners', value: () => String(site.stats.partners), unit: '+' },
] as const

export async function Figures({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'home.stats' })

  return (
    <div className="figures">
      <div className="shell figures-row">
        {FIGURES.map((f, i) => (
          <Reveal key={f.key} className="figure" delay={i * 60}>
            <span className="figure-key t-mono">{t(`${f.key}.label`)}</span>
            <div className="figure-value">
              {f.value()}
              <sup>{f.unit}</sup>
            </div>
            <p className="figure-note">{t(`${f.key}.note`)}</p>
          </Reveal>
        ))}
      </div>
    </div>
  )
}

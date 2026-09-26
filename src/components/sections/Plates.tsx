import { getTranslations } from 'next-intl/server'
import { Reveal } from '@/components/primitives/Reveal'
import { Icon, type IconName } from '@/components/primitives/Icon'
import type { Locale } from '@/config/site'

/**
 * The four capabilities. Keys map to `capabilities.items.*` in the message
 * files — to add or remove one, edit this array and the matching message keys.
 * Nothing else needs to change.
 */
export const CAPABILITIES = [
  { key: 'development', icon: 'chart' },
  { key: 'regulatory', icon: 'institution' },
  { key: 'commercial', icon: 'document' },
  { key: 'representation', icon: 'wrench' },
] as const satisfies ReadonlyArray<{ key: string; icon: IconName }>

/** `heading` follows the page outline: h2 straight under a page title, h3 under a section heading. */
export async function Plates({ locale, showIcons = false, heading: H = 'h3' }: { locale: Locale; showIcons?: boolean; heading?: 'h2' | 'h3' }) {
  const t = await getTranslations({ locale, namespace: 'capabilities.items' })

  return (
    <div className="plates">
      {CAPABILITIES.map((c, i) => (
        <Reveal key={c.key} className="plate" delay={i * 60}>
          <span className="plate-index t-mono">{String(i + 1).padStart(2, '0')}</span>
          {showIcons && <Icon name={c.icon} className="mb-4 h-6 w-6" style={{ color: 'var(--accent)' }} />}
          <H className="t-sub">{t(`${c.key}.title`)}</H>
          <p>{t(`${c.key}.body`)}</p>
          <div className="chips mt-[18px]">
            {t(`${c.key}.tags`).split('|').map(tag => <span key={tag}>{tag}</span>)}
          </div>
        </Reveal>
      ))}
    </div>
  )
}

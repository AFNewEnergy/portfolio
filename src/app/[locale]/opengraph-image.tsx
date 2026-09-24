import { ImageResponse } from 'next/og'
import { getTranslations } from 'next-intl/server'
import { site, type Locale } from '@/config/site'
import { og } from '@/config/theme'

export const alt = `${site.name} — ${site.jobTitle}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Generated at the edge per locale, so there is no static asset to re-export
 * when copy changes. Satori supports a subset of CSS — inline styles only, and
 * no CSS custom properties, which is why config/theme.ts exists.
 */
export default async function OgImage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.og' })

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', background: og.canvas, padding: 76,
        fontFamily: 'serif', position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ flex: 1, borderLeft: `1px solid ${og.line}` }} />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 30, height: 30, border: `1px solid ${og.accent}` }} />
          <div style={{ display: 'flex', color: og.ink3, fontSize: 21, letterSpacing: 3, fontFamily: 'monospace' }}>
            {`${site.location.city.toUpperCase()} · ${site.region}`}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', color: og.ink, fontSize: 66, lineHeight: 1.06, letterSpacing: -2, maxWidth: 920 }}>
            {t('headline')}
          </div>
          <div style={{ display: 'flex', color: og.ink2, fontSize: 27, fontFamily: 'sans-serif' }}>
            {`${site.name} — ${t('role')}`}
          </div>
        </div>

        <div style={{
          display: 'flex', gap: 44, color: og.ink2, fontSize: 22,
          borderTop: `1px solid ${og.line}`, paddingTop: 26, fontFamily: 'sans-serif',
        }}>
          <span>{`${site.stats.years}+ ${t('years')}`}</span>
          <span>{`${site.stats.capacityGW} GW+`}</span>
          <span>{`${site.stats.projects}+ ${t('projects')}`}</span>
        </div>
      </div>
    ),
    size,
  )
}

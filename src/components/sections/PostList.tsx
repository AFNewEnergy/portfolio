import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Insight } from '@/content/types'
import type { Locale } from '@/config/site'
import { formatDate } from '@/lib/format'
import { Reveal } from '@/components/primitives/Reveal'
import { Icon } from '@/components/primitives/Icon'

export async function PostList({ locale, posts }: { locale: Locale; posts: Insight[] }) {
  const t = await getTranslations({ locale })

  return (
    <div>
      {posts.map((p, i) => (
        <Reveal key={p.slug} delay={Math.min(i, 6) * 45}>
          <Link href={`/insights/${p.slug}`} className="post-row">
            <span className="badge" data-kind={p.type}>{t(`insights.type.${p.type}`)}</span>
            <h3 className="t-sub">{p.title}</h3>
            <span className="post-meta t-mono">
              {p.type === 'Video'
                ? t('insights.watch', { minutes: p.readingMinutes })
                : t('insights.read', { minutes: p.readingMinutes })}
              {p.date && ` · ${formatDate(p.date, locale)}`}
            </span>
            <span className="post-go"><Icon name="arrow" strokeWidth={1.8} /></span>
          </Link>
        </Reveal>
      ))}
    </div>
  )
}

import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/primitives/Button'

export default async function NotFound() {
  const t = await getTranslations('notFound')
  return (
    <div className="shell grid min-h-[68vh] place-content-center py-32 text-center">
      <span className="t-mono" style={{ color: 'var(--accent)' }}>404</span>
      <h1 className="t-title mx-auto mt-5 max-w-[16ch]">{t('title')}</h1>
      <p className="t-lede mx-auto mt-5">{t('body')}</p>
      <div className="btn-row mt-9 justify-center">
        <Button href="/" icon="arrow">{t('cta')}</Button>
      </div>
    </div>
  )
}

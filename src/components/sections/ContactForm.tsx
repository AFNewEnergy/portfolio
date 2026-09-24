'use client'

import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { TECHNOLOGIES } from '@/content/types'
import { Icon } from '@/components/primitives/Icon'
import { Button } from '@/components/primitives/Button'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function ContactForm() {
  const t = useTranslations('contact.form')
  const tech = useTranslations('tech')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending'); setError('')
    const data = Object.fromEntries(new FormData(e.currentTarget))
    try {
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'failed')
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'failed')
    }
  }

  if (status === 'sent') {
    return (
      <div className="notice text-center">
        <Icon name="check" strokeWidth={1.5} className="mx-auto mb-4 h-8 w-8" style={{ color: 'var(--accent)' }} />
        <h3 className="t-sub" style={{ color: 'var(--ink)' }}>{t('successTitle')}</h3>
        <p className="mt-2">{t('successBody')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3.5" noValidate>
      {/* Honeypot: bots fill it, humans never see it. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
        className="absolute h-0 w-0 overflow-hidden opacity-0" />

      <div className="grid gap-3.5 sm:grid-cols-2">
        <div className="field">
          <label className="t-mono" htmlFor="name">{t('name')}</label>
          <input id="name" name="name" required maxLength={120} autoComplete="name" placeholder={t('namePlaceholder')} />
        </div>
        <div className="field">
          <label className="t-mono" htmlFor="email">{t('email')}</label>
          <input id="email" name="email" type="email" required maxLength={200} autoComplete="email" placeholder={t('emailPlaceholder')} />
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <div className="field">
          <label className="t-mono" htmlFor="company">{t('company')}</label>
          <input id="company" name="company" maxLength={160} autoComplete="organization" placeholder={t('companyPlaceholder')} />
        </div>
        <div className="field">
          <label className="t-mono" htmlFor="country">{t('country')}</label>
          <input id="country" name="country" maxLength={80} autoComplete="country-name" placeholder={t('countryPlaceholder')} />
        </div>
      </div>

      <div className="field">
        <label className="t-mono" htmlFor="projectType">{t('projectType')}</label>
        <select id="projectType" name="projectType" defaultValue={TECHNOLOGIES[0]}>
          {TECHNOLOGIES.map(x => <option key={x} value={x}>{tech(x)}</option>)}
        </select>
      </div>

      <div className="field">
        <label className="t-mono" htmlFor="message">{t('message')}</label>
        <textarea id="message" name="message" required minLength={10} maxLength={4000} placeholder={t('messagePlaceholder')} />
      </div>

      {status === 'error' && (
        <p role="alert" className="text-[0.88rem]" style={{ color: 'var(--critical)' }}>
          {error === 'rate_limited' ? t('errorRateLimited') : t('errorGeneric')}
        </p>
      )}

      <Button type="submit" disabled={status === 'sending'} className="mt-1 justify-center">
        {status === 'sending' ? t('sending') : t('submit')}
      </Button>

      <p className="t-mono mt-1" style={{ color: 'var(--ink-3)' }}>{t('privacy')}</p>
    </form>
  )
}

import type { Locale } from '@/config/site'

/** 1000 → "1 GW" · 1500 → "1.5 GW" · 750 → "750 MW" */
export function capacityLabel(mw: number | null | undefined): string {
  if (mw == null) return ''
  if (mw >= 1000) {
    const gw = mw / 1000
    return `${Number.isInteger(gw) ? gw : gw.toFixed(1)} GW`
  }
  return `${mw.toLocaleString('en-US')} MW`
}

/** Split for the register table, where the unit is styled separately. */
export function capacityParts(mw: number | null | undefined): { value: string; unit: string } {
  if (mw == null) return { value: '', unit: '' }
  if (mw >= 1000) {
    const gw = mw / 1000
    return { value: Number.isInteger(gw) ? String(gw) : gw.toFixed(1), unit: 'GW' }
  }
  return { value: mw.toLocaleString('en-US'), unit: 'MW' }
}

const INTL: Record<Locale, string> = {
  en: 'en-GB', zh: 'zh-Hans', ar: 'ar', tr: 'tr-TR', de: 'de-DE', fr: 'fr-FR',
}

export function formatDate(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(INTL[locale], { year: 'numeric', month: 'short' }).format(d)
}

/** ~200 wpm, floored at 1. */
export function readingTime(text: string): number {
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200))
}

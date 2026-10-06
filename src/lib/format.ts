import type { Locale } from '@/config/site'
import type { Project } from '@/content/types'

/** Split for the register table, where the unit is styled separately. */
export function capacityParts(mw: number | null | undefined): { value: string; unit: string } {
  if (mw == null) return { value: '', unit: '' }
  if (mw >= 1000) {
    const gw = mw / 1000
    return { value: Number.isInteger(gw) ? String(gw) : gw.toFixed(1), unit: 'GW' }
  }
  return { value: mw.toLocaleString('en-US'), unit: 'MW' }
}

/**
 * A project's size for display: its MW capacity, or for terminals and lines
 * (no MW figure) its rating, e.g. 500 mmscfd or 400 kV.
 */
export function projectSize(p: Pick<Project, 'capacityMW' | 'rating'>): { value: string; unit: string } {
  if (p.capacityMW != null) return capacityParts(p.capacityMW)
  if (p.rating) return { value: p.rating.value.toLocaleString('en-US'), unit: p.rating.unit }
  return { value: '', unit: '' }
}

/** The same as one string: "1.5 GW", "500 mmscfd", "400 kV". */
export function projectSizeLabel(p: Pick<Project, 'capacityMW' | 'rating'>): string {
  const { value, unit } = projectSize(p)
  return value ? `${value} ${unit}` : ''
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

/** 12 Sep 2026 — the full date, for article bylines and cards. */
export function formatDay(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return ''
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso)
  if (Number.isNaN(d.getTime())) return ''
  const out = new Intl.DateTimeFormat(INTL[locale], { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Dhaka' }).format(d)
  return locale === 'en' ? out.replace('Sept', 'Sep') : out
}

/** ~200 wpm, floored at 1. */
export function readingTime(text: string): number {
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200))
}

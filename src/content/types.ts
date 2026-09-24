import type { Locale } from '@/config/site'

export const TECHNOLOGIES = [
  'Solar PV', 'BESS', 'LNG & FSRU', 'Gas / CCPP', 'Coal', 'Transmission', 'Waste-to-Energy',
] as const
export type Technology = (typeof TECHNOLOGIES)[number]

export const STAGES = [
  'Feasibility', 'Bidding', 'Development', 'Approved', 'Construction', 'Operational',
] as const
export type Stage = (typeof STAGES)[number]

/* ── Runtime guards ──────────────────────────────────────────────────────
   Content from Notion is typed by convention, not by the compiler. A select
   option spelled "Solar" instead of "Solar PV" would reach a translation
   lookup that has no such key, and next-intl throws on a missing key — one
   typo in Notion would break the whole page. These guards keep bad values
   out of the app, and the Notion mapper logs what it dropped.             */

export const isTechnology = (v: unknown): v is Technology =>
  typeof v === 'string' && (TECHNOLOGIES as readonly string[]).includes(v)

export const isStage = (v: unknown): v is Stage =>
  typeof v === 'string' && (STAGES as readonly string[]).includes(v)

/** Case- and space-insensitive match, so "solar pv" and "Solar PV" both land. */
function loose<T extends string>(list: readonly T[], value: string): T | undefined {
  const norm = (s: string) => s.toLowerCase().replace(/[\s_-]+/g, ' ').trim()
  const target = norm(value)
  return list.find(x => norm(x) === target)
}

export const coerceTechnology = (v: string): Technology | undefined =>
  isTechnology(v) ? v : loose(TECHNOLOGIES, v)

export const coerceStage = (v: string, fallback: Stage = 'Development'): Stage =>
  isStage(v) ? v : (loose(STAGES, v) ?? fallback)

export type Project = {
  slug: string
  title: string
  summary: string
  capacityMW: number | null
  technology: Technology[]
  stage: Stage
  /** null when `confidential` is true — never leak the name through the type. */
  client: string | null
  confidential: boolean
  location: string | null
  role: string | null
  year: number | null
  metrics: string[]
  cover: string | null
  featured: boolean
  order: number
  /** HTML body for the case-study page. Empty string = index entry only. */
  body: string
}

export type Insight = {
  slug: string
  title: string
  excerpt: string
  type: 'Article' | 'Video'
  videoUrl: string | null
  cover: string | null
  tags: string[]
  date: string | null
  readingMinutes: number
  body: string
}

/**
 * The contract every content backend implements.
 * `local` and `notion` are interchangeable — pages never know which is active.
 */
export interface ContentSource {
  getProjects(locale: Locale, opts?: { featuredOnly?: boolean; limit?: number }): Promise<Project[]>
  getProject(locale: Locale, slug: string): Promise<Project | null>
  getInsights(locale: Locale, opts?: { limit?: number }): Promise<Insight[]>
  getInsight(locale: Locale, slug: string): Promise<Insight | null>
}

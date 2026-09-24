import type { ContentSource, Project, Insight } from '../types'
import { projects } from './projects'
import { insights } from './insights'

/**
 * Local backend.
 *
 * Content is currently authored in English only; every locale receives the same
 * rows so no page 404s while translations are in progress. When per-locale
 * content exists, key these maps by locale and select here — the interface is
 * unchanged.
 */
const byOrder = (a: Project, b: Project) => a.order - b.order
const byDate = (a: Insight, b: Insight) => (b.date ?? '').localeCompare(a.date ?? '')

export const localSource: ContentSource = {
  async getProjects(_locale, opts) {
    let rows = [...projects].sort(byOrder)
    if (opts?.featuredOnly) rows = rows.filter(p => p.featured)
    return opts?.limit ? rows.slice(0, opts.limit) : rows
  },

  async getProject(_locale, slug) {
    return projects.find(p => p.slug === slug) ?? null
  },

  async getInsights(_locale, opts) {
    const rows = [...insights].sort(byDate)
    return opts?.limit ? rows.slice(0, opts.limit) : rows
  },

  async getInsight(_locale, slug) {
    return insights.find(p => p.slug === slug) ?? null
  },
}

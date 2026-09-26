import type { ContentSource } from './types'
import { localSource } from './local'

/**
 * Adapter selector.
 *
 * Insights — from Notion whenever NOTION_TOKEN is set. Until the Insights
 *   database exists (the one-time /api/notion/setup link creates it), the
 *   site keeps showing the sample articles in src/content/samples, so a
 *   half-finished setup can never empty the page.
 *   INSIGHTS_SOURCE=local forces the samples, e.g. while testing.
 *
 * Projects — local typed files unless CONTENT_SOURCE=notion (see NOTION-SETUP.md).
 *
 * The Notion code is loaded lazily, so the SDK is never bundled unless used.
 */
const hasToken = () => Boolean(process.env.NOTION_TOKEN)
const insightsFromNotion = () => hasToken() && process.env.INSIGHTS_SOURCE !== 'local'
const projectsFromNotion = () => hasToken() && process.env.CONTENT_SOURCE === 'notion'

const building = () => process.env.NEXT_PHASE === 'phase-production-build'

/**
 * Before the Insights database exists, a build shows the sample articles.
 *
 * On the live site "no database" is treated like any other failure and
 * thrown: Next then keeps serving the last good version of the page. That
 * way a Notion search that misses once can never swap real articles for the
 * samples; before setup the last good version already is the samples.
 *
 * Any other Notion failure during a build stops the deploy, so Vercel keeps
 * the live site, with its real articles, instead of publishing the samples.
 */
let warned = false
async function withFallback<T>(label: string, live: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try {
    return await live()
  } catch (e: any) {
    if (e?.name === 'NotSetUp' && building()) {
      if (!warned) console.warn('[content] Notion: no Insights database yet — showing the sample articles. Open /api/notion/setup to create it.')
      warned = true
      return fallback()
    }
    if (building()) {
      console.error(
        `[content] Could not read ${label} from Notion (${e?.code ?? e?.message ?? e}). The deploy was stopped so the live site keeps its current articles. ` +
        'Check NOTION_TOKEN in Vercel and that the Website page is shared with the connection, then redeploy.',
      )
    }
    throw e
  }
}

async function resolve(): Promise<ContentSource> {
  if (process.env.CONTENT_SOURCE === 'notion' && !hasToken()) {
    console.warn('[content] CONTENT_SOURCE=notion but NOTION_TOKEN is missing — falling back to local.')
  }
  if (!insightsFromNotion() && !projectsFromNotion()) return localSource

  const { notionSource } = await import('./notion')
  const projects = projectsFromNotion() ? notionSource : localSource

  return {
    getProjects: (l, o) => projects.getProjects(l, o),
    getProject: (l, s) => projects.getProject(l, s),
    getInsights: insightsFromNotion()
      ? (l, o) => withFallback('insights', () => notionSource.getInsights(l, o), () => localSource.getInsights(l, o))
      : (l, o) => localSource.getInsights(l, o),
    getInsight: insightsFromNotion()
      ? (l, s) => withFallback('article', () => notionSource.getInsight(l, s), () => localSource.getInsight(l, s))
      : (l, s) => localSource.getInsight(l, s),
  }
}

let cached: Promise<ContentSource> | null = null
export const content = (): Promise<ContentSource> => (cached ??= resolve())

export * from './types'

import { Client } from '@notionhq/client'

/**
 * Notion client pinned to the current API version.
 *
 * Note: `databases.query` no longer exists in SDK v5 — data is read through
 * `dataSources.query`. Older tutorials will not work.
 *
 * NOTION_API_URL exists only for the test suite, which points the client at a
 * local stand-in for api.notion.com. Leave it unset everywhere else.
 */
export const notion = new Client({
  auth: process.env.NOTION_TOKEN!,
  notionVersion: '2026-03-11',
  timeoutMs: 20_000,
  ...(process.env.NOTION_API_URL ? { baseUrl: process.env.NOTION_API_URL } : {}),
})

/**
 * For the photo and file relays: a visitor is waiting, so fail fast instead of
 * waiting out long retry back-offs past the function's time limit.
 */
export const notionQuick = new Client({
  auth: process.env.NOTION_TOKEN!,
  notionVersion: '2026-03-11',
  timeoutMs: 8_000,
  retry: { maxRetries: 1, maxRetryDelayMs: 2_000 },
  ...(process.env.NOTION_API_URL ? { baseUrl: process.env.NOTION_API_URL } : {}),
})

/** Optional. When blank, the Insights database is found automatically. */
export const INSIGHTS_DS = process.env.NOTION_INSIGHTS_DS ?? ''
export const PROJECTS_DS = process.env.NOTION_PROJECTS_DS ?? ''

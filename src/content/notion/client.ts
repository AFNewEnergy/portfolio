import { Client } from '@notionhq/client'

/**
 * Notion client pinned to the current API version.
 *
 * Note: `databases.query` no longer exists in SDK v5 — data is read through
 * `dataSources.query`. Older tutorials will not work.
 */
export const notion = new Client({
  auth: process.env.NOTION_TOKEN!,
  notionVersion: '2026-03-11',
})

export const INSIGHTS_DS = process.env.NOTION_INSIGHTS_DS ?? ''
export const PROJECTS_DS = process.env.NOTION_PROJECTS_DS ?? ''

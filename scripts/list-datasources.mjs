#!/usr/bin/env node
/**
 * Lists every database the integration can see, with its DATA SOURCE IDs —
 * the values you need for NOTION_INSIGHTS_DS and NOTION_PROJECTS_DS.
 *
 *   npm i @notionhq/client
 *   NOTION_TOKEN=ntn_xxx node scripts/list-datasources.mjs
 */
import { Client } from '@notionhq/client'

const token = process.env.NOTION_TOKEN
if (!token) {
  console.error('\n  Missing NOTION_TOKEN.\n  Usage: NOTION_TOKEN=ntn_xxx node scripts/list-datasources.mjs\n')
  process.exit(1)
}

const notion = new Client({ auth: token, notionVersion: '2026-03-11' })

const dim = s => `\x1b[2m${s}\x1b[0m`
const grn = s => `\x1b[32m${s}\x1b[0m`
const bld = s => `\x1b[1m${s}\x1b[0m`

try {
  // Search returns data source objects directly in current API versions.
  const res = await notion.search({
    filter: { property: 'object', value: 'data_source' },
    page_size: 100,
  })

  if (!res.results.length) {
    console.log(`
  No data sources visible to this integration.

  Almost always this means the connection step was skipped:
    open the database in Notion → ⋯ (top right) → Connections → pick your integration
`)
    process.exit(0)
  }

  console.log(`\n  ${bld(`Found ${res.results.length} data source(s)`)}\n`)

  for (const ds of res.results) {
    const name =
      ds.title?.map(t => t.plain_text).join('') ||
      ds.name ||
      '(untitled)'
    const props = Object.keys(ds.properties ?? {})

    console.log(`  ${bld(name)}`)
    console.log(`    data_source_id : ${grn(ds.id)}`)
    if (ds.parent?.database_id) {
      console.log(`    database_id    : ${dim(ds.parent.database_id)} ${dim('(not what you want)')}`)
    }
    console.log(`    properties     : ${dim(props.join(', ') || 'none')}`)
    console.log()
  }

  console.log(`  ${dim('Copy the green data_source_id values into .env.local:')}`)
  console.log(`  ${dim('NOTION_INSIGHTS_DS=...   NOTION_PROJECTS_DS=...')}\n`)
} catch (e) {
  console.error(`\n  ${e.code ?? 'error'}: ${e.message}\n`)
  if (e.code === 'unauthorized') {
    console.error('  The token is wrong, or the integration was deleted/regenerated.\n')
  }
  process.exit(1)
}

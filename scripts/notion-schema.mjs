#!/usr/bin/env node
/**
 * Prints the Notion database schemas this codebase reads.
 * (The Insights database is created automatically by /api/notion/setup.)
 *
 *   npm run notion:schema
 *
 * The allowed option lists are read out of src/content/types.ts and
 * src/config/site.ts at runtime, so this can never drift from the code.
 */
import { readFileSync } from 'node:fs'

const read = f => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8')

/** Pull the string literals out of `export const NAME = [ ... ]`. */
function literals(source, name) {
  const at = source.indexOf('export const ' + name)
  if (at < 0) return []
  const open = source.indexOf('[', at)
  const close = source.indexOf(']', open)
  return source
    .slice(open + 1, close)
    .split(',')
    .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean)
}

const types = read('content/types.ts')
const config = read('config/site.ts')

const TECHNOLOGIES = literals(types, 'TECHNOLOGIES')
const STAGES = literals(types, 'STAGES')
const LOCALES = literals(config, 'LOCALES')

const bold = s => `\x1b[1m${s}\x1b[0m`
const dim = s => `\x1b[2m${s}\x1b[0m`
const row = (name, type, note = '') => console.log(`  ${name.padEnd(15)} ${type.padEnd(13)} ${dim(note)}`)
const rule = () => console.log(dim('  ' + '─'.repeat(76)))

console.log(`\n${bold('DATABASE 1 — Insights')}   ${dim('created for you by /api/notion/setup — see NOTION-SETUP.md')}\n`)
row('PROPERTY', 'TYPE', 'NOTES')
rule()
row('Title', 'Title', 'the headline (required)')
row('Subtitle', 'Text', 'line under the headline; card text; meta description')
row('Published', 'Checkbox', 'ONLY checked rows appear on the site (required)')
row('Date', 'Date', 'publish date, newest first; blank = page creation day')
row('Topic', 'Select', 'the coloured label above the headline')
row('Tags', 'Multi-select', 'keywords at the end of the article')
row('Type', 'Select', 'Article | Video — blank = Article')
row('Video URL', 'URL', 'only when Type = Video')
row('Video minutes', 'Number', 'only when Type = Video')
row('Cover caption', 'Text', 'caption under the cover; "… | Photo: Name" adds a credit')
row('Slug', 'Text', 'optional; blank = headline + short id')
row('Language', 'Select', 'blank = en. For a translated copy: same Slug + ' + LOCALES.join(' | '))
console.log(dim('\n  The cover is the page cover. Reading time is counted from the text.'))

console.log(`\n${bold('DATABASE 2 — Projects')}   ${dim('the register')}\n`)
row('PROPERTY', 'TYPE', 'NOTES')
rule()
row('Title', 'Title', '')
row('Slug', 'Text', 'unique')
row('Language', 'Select', 'exactly:  ' + LOCALES.join('  |  '))
row('Summary', 'Text', 'REQUIRED — the register and cards show this. The body')
row('', '', 'fallback only applies on the detail page.')
row('Capacity MW', 'Number', 'store 1000 for 1 GW — the site formats it')
row('Technology', 'Multi-select', 'allowed options listed below')
row('Stage', 'Select', 'allowed options listed below')
row('Client', 'Text', 'hidden automatically when Confidential is checked')
row('Confidential', 'Checkbox', 'renders "Confidential sponsor" instead of the client')
row('Location', 'Text', '')
row('Role', 'Text', 'e.g. Independent Consultant')
row('Year', 'Number', '')
row('Metric 1', 'Text', 'e.g. 20% BESS')
row('Metric 2', 'Text', '')
row('Metric 3', 'Text', '')
row('Cover URL', 'URL', '')
row('Featured', 'Checkbox', 'shows on the homepage')
row('Order', 'Number', 'manual sort; blank sorts last')
row('Published', 'Checkbox', 'ONLY checked rows appear')

console.log(`\n${bold('Technology — allowed multi-select options')}`)
console.log(dim('  Type these exactly. Anything else is dropped with a warning in the'))
console.log(dim('  build log rather than breaking the page.\n'))
for (const t of TECHNOLOGIES) console.log('    · ' + t)

console.log(`\n${bold('Stage — allowed select options')}`)
console.log(dim('  An unrecognised value falls back to "Development" with a warning.\n'))
for (const s of STAGES) console.log('    · ' + s)

console.log(`\n${bold('Language — allowed select options')}\n`)
console.log('    ' + LOCALES.join('   '))
console.log(dim('\n  Set Language = en on every row to begin with. A locale with no'))
console.log(dim('  translated row falls back to the ' + LOCALES[0] + ' row automatically, so'))
console.log(dim('  nothing 404s. Add a translated row later and it takes over.\n'))

#!/usr/bin/env node
/**
 * Reads every colour out of src/styles/tokens.css and checks the pairs that
 * actually appear on screen against WCAG 2.1 AA.
 *
 *   npm run contrast
 *
 * Run this after changing any token. It parses the real file rather than a
 * duplicated list, so the two can never drift apart.
 */
import { readFileSync } from 'node:fs'
import { ratio, oklch } from './contrast-lib.mjs'

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8')

/** Pull `--name: #hex` pairs from a block, ignoring rgb()/var() values. */
function block(selector) {
  const start = css.indexOf(selector)
  if (start < 0) throw new Error(`token block not found: ${selector}`)
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start))
  const out = {}
  for (const [, k, v] of body.matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) out[k] = v
  return out
}

const MODES = { light: block(':root {'), dark: block("[data-theme='dark'] {") }

/* [label, foreground, background, minimum, note] */
const pairs = t => [
  ['ink on canvas',            t.ink,        t.canvas,       7,   'AAA — headings and body'],
  ['ink-2 on canvas',          t['ink-2'],   t.canvas,       4.5, 'AA — secondary prose'],
  ['ink-3 on canvas',          t['ink-3'],   t.canvas,       3,   'mono labels only, never body'],
  ['accent on canvas',         t.accent,     t.canvas,       4.5, 'links and markers'],
  ['on-accent on accent',      t['on-accent'], t.accent,     4.5, 'label inside a filled button'],
  ['warm on canvas',           t.warm,       t.canvas,       4.5, 'secondary accent'],
  ['ink on surface',           t.ink,        t.surface,      7,   'hover and raised blocks'],
  ['ink-2 on surface',         t['ink-2'],   t.surface,      4.5, ''],
  ['ink-3 on surface',         t['ink-3'],   t.surface,      3,   ''],
  ['accent on surface',        t.accent,     t.surface,      4.5, ''],
  ['ink on raised',            t.ink,        t.raised,       7,   'form inputs'],
  ['ok on canvas',             t.ok,         t.canvas,       4.5, 'status — reserved'],
  ['caution on canvas',        t.caution,    t.canvas,       4.5, ''],
  ['critical on canvas',       t.critical,   t.canvas,       4.5, ''],
  ['line-strong on canvas',    t['line-strong'], t.canvas,   1.4, 'UI boundary, non-text'],
]

let failures = 0
for (const [mode, t] of Object.entries(MODES)) {
  console.log(`\n\x1b[1m${mode.toUpperCase()}\x1b[0m  canvas ${t.canvas} · accent ${t.accent}`)
  for (const [label, fg, bg, min, note] of pairs(t)) {
    if (!fg || !bg) { console.log(`  \x1b[33m?\x1b[0m ${label} — token missing`); failures++; continue }
    const r = ratio(fg, bg)
    const ok = r >= min
    if (!ok) failures++
    console.log(`  ${ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${label.padEnd(24)} ${r.toFixed(2).padStart(6)}:1  min ${String(min).padEnd(4)} ${note}`)
  }
  const a = oklch(t.accent)
  console.log(`  accent OKLCH  L ${a.L.toFixed(3)}  C ${a.C.toFixed(3)}  h ${a.h.toFixed(0)}°`)
}

const total = Object.keys(MODES).length * pairs(MODES.light).length
console.log(failures
  ? `\n\x1b[31m${failures} of ${total} checks FAILED\x1b[0m\n`
  : `\n\x1b[32mAll ${total} checks pass\x1b[0m\n`)
process.exit(failures ? 1 : 0)

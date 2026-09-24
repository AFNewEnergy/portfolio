# Meridian — design system

The visual language of this site. One file governs it: **`src/styles/tokens.css`**.
No component contains a raw colour, font name, or radius.

---

## Concept

**Institutional editorial.** The reference points are published research and
annual reports — an energy ministry document, an FT sector piece, an Ørsted
project page — not a software product. A lender, a Japanese trading house and a
Chinese EPC should all read it as *serious*.

Three decisions carry that:

1. **A serif for headings.** Newsreader, set at 400 weight with tight tracking.
   Serif signals published authority in a way no geometric sans does.
2. **Squared corners.** 2px, everywhere. Rounded corners read consumer-app.
3. **Hairlines instead of shadows.** Every boundary is a 1px rule. Nothing
   floats, nothing glows.

Emphasis is carried by **italic**, never bold and never a second colour —
so a heading reads as one sentence with a stressed phrase, the way print does.

---

## Colour

Verified, not eyeballed. `npm run contrast` parses `tokens.css` and checks the
pairs that actually appear on screen. **30 checks, both modes, all pass.**

### Light — warm paper, never pure white

| Role | Value | On canvas | Use |
|---|---|---|---|
| `--canvas` | `#FAF8F4` | — | page |
| `--surface` | `#F2EFE8` | — | hover, raised blocks |
| `--raised` | `#FFFFFF` | — | form inputs only |
| `--line` | `#DFDACE` | — | hairlines |
| `--line-strong` | `#C4BCA9` | 1.78:1 | UI boundaries |
| `--ink` | `#14171A` | **16.96:1** | headings, body |
| `--ink-2` | `#4A4F55` | **7.79:1** | secondary prose |
| `--ink-3` | `#767C84` | **3.97:1** | mono labels only — never body |
| `--accent` | `#0B6C63` | **5.93:1** | links, markers, primary fill |
| `--on-accent` | `#FFFFFF` | 6.29:1 on accent | button labels |
| `--warm` | `#96541A` | 5.53:1 | secondary accent |

### Dark — selected, not inverted

Each value was re-stepped for the dark plane and re-validated. This is why the
accent is a different hex, not the same teal on a black background.

| Role | Value | On canvas |
|---|---|---|
| `--canvas` | `#0C1013` | — |
| `--surface` | `#141A1F` | — |
| `--ink` | `#EDF0F2` | **16.69:1** |
| `--ink-2` | `#A3ADB6` | **8.38:1** |
| `--ink-3` | `#7B858E` | **5.08:1** |
| `--accent` | `#4CC9B8` | **9.42:1** |
| `--on-accent` | `#06201C` | 8.41:1 on accent |

**Accent choice:** deep verdigris teal, OKLCH hue 185° light / 183° dark.
Teal reads *grid and electricity* without the cliché of solar-yellow, holds
authority in both modes, and is culturally neutral across all six locales —
which matters when the audience is Chinese, Gulf, Turkish and European.

**Status colours are reserved.** `--ok`, `--caution`, `--critical` never get
reused for decoration, and always ship with a label, never colour alone.

---

## Type

| Role | Face | Where |
|---|---|---|
| Display | **Newsreader** 400/500 + italic | headings, capacities, organisation names |
| Body & UI | **Inter** 300/400/500 | prose, navigation, buttons |
| Data | **JetBrains Mono** 400/500 | labels, years, stages, eyebrows |
| Arabic | **Noto Sans Arabic** | full `ar` locale |
| Chinese | **Noto Sans SC** | full `zh` locale |

Named size classes, not raw tags — so heading *level* (semantics) and heading
*size* (visual) are chosen independently:

| Class | Size |
|---|---|
| `.t-hero` | `clamp(2.5rem, 6vw, 5.2rem)` |
| `.t-title` | `clamp(1.7rem, 3.6vw, 3rem)` |
| `.t-sub` | `clamp(1.15rem, 1.9vw, 1.5rem)` |
| `.t-lede` | `clamp(1.05rem, 1.5vw, 1.28rem)`, max 48ch |
| `.t-mono` | `0.68rem`, `0.14em` tracking, uppercase |

**Script-aware emphasis.** Arabic and Chinese have no true italic; browsers
synthesise a slant that looks broken. Those locales get an accent-coloured
emphasis instead — same stress, no faked cut.

---

## The signature motif

Every section opens with a **rail**: a small accent square, a mono label, and a
hairline running to the edge of the column.

```tsx
<Rail>03 / Register</Rail>
```

It replaces the boxed eyebrow badge most sites use, and it is the one element
that makes the page feel like a single document rather than stacked cards.

---

## Components

| Class | What it is |
|---|---|
| `.hero-grid` | The visible 12-column rule grid behind the hero — the institutional cue |
| `.figures-row` | Statistics strip; serif numerals with a mono accent unit as `<sup>` |
| `.plates` | 2×2 capability grid, 1px gaps, accent bar wipes in on hover |
| `.register` | The project table. Serif capacities, stage markers that fill by maturity |
| `.partner-grid` | Static bordered grid — a logo wall implies endorsement |
| `.post-row` | Editorial list; serif title turns accent on hover |
| `.tl-row` | Career timeline, two columns |
| `.facts` | Project-detail spec grid |
| `.cta-band` | Surface-toned band, no glow |
| `.wordmark` | Outlined stroke type in the footer |

**Stage markers encode maturity honestly:**

| Stage | Marker |
|---|---|
| Feasibility, Bidding | hollow, muted border |
| Development | hollow, accent border |
| Approved, Construction, Operational | filled accent |

---

## Responsive

Breakpoints are grouped at the bottom of `globals.css` rather than scattered, so
a layout change at one size is one place to look.

| Width | Behaviour |
|---|---|
| ≥ 2400px | root 19px, container 1760px — reads correctly on a TV |
| ≥ 1800px | root 17.5px, container 1520px |
| ≤ 1080px | register collapses to 3 columns |
| ≤ 960px | nav → drawer, hero stacks, grid overlay off, plates single column |
| ≤ 720px | figures 2×2, post meta hidden |
| ≤ 680px | language button collapses to its globe icon |
| ≤ 520px | footer single column, brand name shrinks |
| `hover: none` | all hover-only affordances disabled |

Verified with a real browser at 360 / 375 / 390 / 430 / 768 / 1024 / 1440 /
2560px — **zero horizontal overflow at every size.**

---

## Photography

Five photographs, one per page, framed in the same bordered plate as the tables.
Restraint is the rule — this language leans on typography and rules, so an image
in every section would fight it.

| File | Used on | Source size | Notes |
|---|---|---|---|
| `photos/portrait.jpg` | Home hero | 762 × 1017 | Exactly 3:4 — the reason it is the hero |
| `photos/standing.jpg` | About | 546 × 787 | Beside the career intro |
| `photos/boardroom.jpg` | Services | 1111 × 596 | Full-width band |
| `photos/desk-wide.jpg` | Projects | 763 × 399 | Inside the shell, not full-bleed |
| `photos/window.jpg` | Contact | 760 × 610 | Beside the direct-contact rows |
| `photos/desk-portrait.jpg` | — | 558 × 789 | Unused alternate |

Paths and intrinsic dimensions live together in `site.photos`, so `next/image`
never guesses and no page can shift on load. `npm run preflight` reads that map
and checks each file exists.

**Two constraints worth knowing before swapping images:**

1. **Never display a photo wider than its source.** The full-width band caps at
   `300px` tall for this reason: at 1440px wide a 21:9 strip would be 617px tall
   and stretch the 1111px source past 1.3×. The Projects photo sits inside the
   shell rather than full-bleed because its source is only 763px wide.
2. **Crop position is computed, not guessed.** `object-position: center 25%` on a
   band places the subject's face in frame — `center center` cut his head off.

---

## How to change things

| I want to… | Edit |
|---|---|
| Change the brand colour | `src/styles/tokens.css` → `--accent`, then `npm run contrast` |
| Change the whole palette | same file, both blocks |
| Change a heading size | `globals.css` → `.t-hero` / `.t-title` |
| Change the display font | `[locale]/layout.tsx` (import) + `tokens.css` (`--serif`) |
| Restyle the register | `globals.css` → `.register`, `.reg-*` |
| Add a capability | `sections/Plates.tsx` → `CAPABILITIES` + `capabilities.items.<key>` in all six locales |
| Add a career role | `sections/Timeline.tsx` → `CAREER` + `about.roles.<key>` |
| Add a technology | `content/types.ts` → `TECHNOLOGIES`, an icon in `TECH_ICON`, a `tech.<name>` message |
| Add a nav item | `config/site.ts` → `NAV` + `NAV_PATH`, a `nav.<key>` message, a page folder |
| Swap a photo | drop the file in `public/photos/`, update `site.photos` (path **and** dimensions) |
| Rename the site | `config/site.ts` |

Two rules keep it clean:

1. **No raw values in components.** If you find yourself typing a hex code or a
   px font-size in a `.tsx` file, it belongs in `tokens.css` or `globals.css`.
2. **Layout in Tailwind, appearance in CSS.** Tailwind handles grid, flex and
   spacing. Everything visual is a named class — so restyling never means
   reading JSX.

---

## Accessibility

- WCAG 2.1 AA on every text pair, both modes — enforced by `npm run contrast`
- Body text is AAA (7:1+) in both modes, not just AA
- Focus ring: 2px accent, 3px offset, on every interactive element
- Skip-to-content link, semantic landmarks, labelled form fields
- `prefers-reduced-motion` kills all animation and transition
- `hover: none` removes hover-only affordances on touch
- Identity is never colour-alone: stage markers pair a shape with a text label

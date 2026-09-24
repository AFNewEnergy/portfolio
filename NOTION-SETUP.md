# Connecting the site to Notion

The site ships with content in typed files (`src/content/local/`). Everything
below switches it to Notion so Faisal can publish without touching code. It is
one environment variable — no code change, and you can switch back the same way.

**Before you start, know this:** Notion changed its API in a breaking way. Almost
every tutorial online is out of date — they use `databases.query` and a
`database_id`. That path is dead for new integrations. The current model is:

```
Database  →  contains one or more  →  Data Sources  →  contain  →  Pages
```

You query a **data source**, not a database. This codebase uses
`@notionhq/client` v5 with `Notion-Version: 2026-03-11`.

Budget about 45 minutes. Steps 1–5 are the setup; step 6 is the one that
silently breaks sites months later, so don't skip it.

---

## Step 1 — Create the integration

1. Go to **notion.so/profile/integrations**
2. **New integration** → Internal
3. Name it `Faisal Website`, pick Faisal's workspace
4. Capabilities: **Read content** only. Nothing else — the site never writes.
5. Copy the **Internal Integration Secret**. It starts with `ntn_`.

> This token is a password to the whole workspace. It goes in Vercel
> environment variables — never in the repo, never in a screenshot, never in a
> chat message.

---

## Step 2 — Print the schema

Run this first. It reads the allowed values out of the source code, so it can
never drift from what the site actually expects:

```bash
npm run notion:schema
```

Build the two databases to match what it prints. The tables below are the same
thing in prose.

In Notion, create a page called `Website` and add two **full-page databases**
inside it.

### Database A — `Insights`

| Property | Type | Notes |
|---|---|---|
| `Title` | Title | the headline |
| `Slug` | Text | URL segment — lowercase-with-hyphens, unique |
| `Language` | Select | `en` `zh` `ar` `tr` `de` `fr` — set `en` on every row to start |
| `Type` | Select | exactly `Article` or `Video` |
| `Video URL` | URL | only when Type = Video |
| `Excerpt` | Text | 1–2 sentences — used on cards and as the meta description |
| `Cover URL` | URL | a permanent link, **not** a Notion file upload — see step 6 |
| `Tags` | Multi-select | free text |
| `Reading Minutes` | Number | **fill this in** — see the note below |
| `Published` | Checkbox | only checked rows appear on the site |
| `Date` | Date | publish date, drives the sort order |

> **Why `Reading Minutes` is manual.** Listing pages deliberately don't download
> each article's body — that would be one extra API call per row on every
> rebuild. So the site can't measure length at listing time. Leave this blank
> and every card reads "1 min read". Roughly 200 words per minute.

### Database B — `Projects`

| Property | Type | Notes |
|---|---|---|
| `Title` | Title | |
| `Slug` | Text | unique |
| `Language` | Select | same six; set `en` on every row to start |
| `Summary` | Text | **required** — this is what the register and cards show |
| `Capacity MW` | Number | store `1000` for 1 GW; the site formats it |
| `Technology` | Multi-select | see the allowed list below |
| `Stage` | Select | see the allowed list below |
| `Client` | Text | hidden automatically when `Confidential` is ticked |
| `Confidential` | Checkbox | renders "Confidential sponsor" instead of the client name |
| `Location` | Text | |
| `Role` | Text | e.g. Independent Consultant |
| `Year` | Number | |
| `Metric 1` / `2` / `3` | Text | e.g. `20% BESS` |
| `Cover URL` | URL | see step 6 |
| `Featured` | Checkbox | eligible for the homepage |
| `Order` | Number | manual sort; blank sorts last |
| `Published` | Checkbox | only checked rows appear |

> **`Summary` is not optional.** The register, the homepage and the project cards
> all show it. There is a fallback to the first 180 characters of the page body,
> but it only fires on the detail page, where the body is loaded. Leave `Summary`
> blank and the register shows a blank line. The build log warns you by name for
> every row that's missing it.

**Allowed `Technology` options** — type them exactly:

```
Solar PV · BESS · LNG & FSRU · Gas / CCPP · Coal · Transmission · Waste-to-Energy
```

**Allowed `Stage` options:**

```
Feasibility · Bidding · Development · Approved · Construction · Operational
```

Case and spacing are forgiven — `solar pv` and `Solar_PV` both resolve to
`Solar PV`. A genuinely different name (`Solar`) is **dropped with a warning in
the build log** rather than breaking the page. An unrecognised `Stage` falls back
to `Development`, also with a warning. Read the build log after your first
Notion deploy.

The **page body** of each row is the long-form content — that's what renders as
the article or the case study.

---

## Step 3 — Connect the integration to each database

This is the step everyone forgets, and it produces a confusing
`object_not_found` rather than a permissions error.

On each database page: **⋯ (top right) → Connections → `Faisal Website`** →
Confirm.

Do it for **both** databases. The integration cannot see anything you haven't
explicitly connected.

---

## Step 4 — Get the data source IDs

The ID in the browser URL is the *database* ID. You need the *data source* ID
inside it. There's a helper:

```bash
NOTION_TOKEN=ntn_xxx npm run notion:ids
```

It prints every data source the integration can see:

```
Insights
  data_source_id : 8a7c9d10-...   ← use this one
  database_id    : 24f1b2c3-...   (not what you want)
  properties     : Title, Slug, Language, Type, ...
```

Check the `properties` line against step 2 while you're here — a typo in a
property name shows up as a missing field on the site, not an error.

If it prints "No data sources visible", step 3 was skipped.

---

## Step 5 — Environment variables

In `.env.local` for local work, and in Vercel under
**Settings → Environment Variables**:

```bash
CONTENT_SOURCE=notion
NOTION_TOKEN=ntn_xxxxxxxxxxxxxxxxxxxxxxxx
NOTION_INSIGHTS_DS=8a7c9d10-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOTION_PROJECTS_DS=3b2e5f41-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=https://abdullahfaisal.com
REVALIDATE_SECRET=any-long-random-string
```

Add them to **all three** Vercel environments (Production, Preview, Development),
or preview builds fail with an unhelpful error.

`CONTENT_SOURCE=notion` is the switch. Remove it and the site returns to the
local files with no other change. If it's set but `NOTION_TOKEN` is missing, the
site logs a warning and falls back to local content rather than failing the
build — so a half-finished setup can't take the site down.

Test locally before deploying:

```bash
npm run dev
```

---

## Step 6 — The image trap (read this one)

Files uploaded **into** Notion get temporary S3 URLs that **expire after about
one hour**. A statically generated page holding one of those URLs shows broken
images the next day. This is the single most common way a Notion-backed site
quietly breaks, and it breaks *after* you've stopped watching.

Three options, in order of preference:

1. **`Cover URL` as a plain URL property** (what this setup uses) — host images
   in the repo under `public/covers/`, or on any image host, and paste the URL.
   Permanent, free, zero moving parts. **Recommended.**
2. **Vercel Blob** — on build, download the Notion file once and re-host it.
   Robust, but adds a dependency and a small cost.
3. **Use the Notion file URL directly** — only viable with an ISR window under
   30 minutes. Fragile. Avoid.

The same applies to images placed *inside* a page body. The block renderer
prefers external URLs over Notion-hosted ones for exactly this reason, so paste
image links into the body rather than uploading files.

Remote images also need their host allowed in `next.config.ts` under
`images.remotePatterns`. `**.amazonaws.com` and `images.unsplash.com` are
already there.

---

## How the six languages work

Faisal writes each project and article **once, in English**, with `Language = en`.

When someone visits `/zh/projects`, the site asks Notion for Chinese rows first.
If there are none, it falls back to the English rows automatically. Nothing
404s, and no row has to be duplicated six times.

To translate something later, add a second row with the same `Slug` and
`Language = zh`. It takes precedence for Chinese visitors immediately — no code
change, no redeploy. You can translate one article at a time; anything
untranslated keeps showing English.

Note this is per-row, not per-field: a Chinese row supplies all of its own
fields. And translating *one* project doesn't switch the whole register to
Chinese — only that project.

---

## Keeping the site in sync

**Default: ISR.** Pages declare `export const revalidate = 300`, so the homepage,
projects and insights rebuild at most once every 5 minutes when someone visits.
About/services/contact are hourly. Faisal edits in Notion, waits a few minutes,
refreshes. Nothing to run.

**Instant updates (optional).** Hit the revalidate endpoint:

```
https://yoursite.com/api/revalidate?secret=YOUR_SECRET&path=/en/insights
```

Omit `&path` to refresh every locale and section at once. Bookmark it, or wire
it to a Notion database automation (Business plan and above) so publishing
triggers it automatically. It needs `REVALIDATE_SECRET` set, or it returns 500.

---

## Where the code lives

You shouldn't need to touch any of this, but so you know:

```
src/content/index.ts          the switch — reads CONTENT_SOURCE, lazy-loads the SDK
src/content/types.ts          Project and Insight shapes; the allowed option lists
src/content/local/            the typed-files backend (the default)
src/content/notion/
  client.ts                   SDK client, API version, the two *_DS env vars
  props.ts                    property readers; each returns a safe default
  render.ts                   Notion blocks → HTML
  index.ts                    mappers, queries, locale fallback, pagination
scripts/notion-schema.mjs     prints the schema in step 2
scripts/list-datasources.mjs  prints the IDs in step 4
src/app/api/revalidate/       the on-demand refresh endpoint
```

Pages never import the Notion code directly. They call `content()` from
`@/content`, which returns whichever backend is configured — so `local` and
`notion` are interchangeable and no page knows which is running.

---

## Common errors and what they actually mean

| Symptom | Real cause |
|---|---|
| `object_not_found` | Step 3 skipped — integration not connected to that database |
| `validation_error: database_id` | Passed a database ID where a data source ID is required |
| `Could not find data source` | Wrong ID, or the database is in a different workspace |
| `unauthorized` | Token wrong, or the integration was deleted/regenerated |
| Site still shows the old content | `CONTENT_SOURCE=notion` not set, or not set in that Vercel environment |
| Every card says "1 min read" | `Reading Minutes` is blank — see step 2 |
| Blank line in the register | `Summary` is blank on that row — check the build log |
| A technology is missing from a project | Option spelled differently from the allowed list — check the build log |
| Images 403 after a day | Step 6 — Notion file URLs expired |
| Works locally, empty on Vercel | Env vars not added to the Production environment |
| Nothing appears at all | `Published` unchecked, or `Language` not set to a valid locale |

---

## Cost

Free. Notion's API has no charge on any plan, including personal. The only limit
is roughly 3 requests per second, which ISR keeps you far below.

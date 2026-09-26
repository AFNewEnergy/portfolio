# Insights from Notion

Faisal writes articles in Notion. The website's Insights page reads them from
there and shows each one as a full article on the site. Nobody touches code to
publish.

```
Notion: Website page → Insights database → one page per article
                                                  │
Website: /insights  ← list (photo grid or list, pages, All)
         /insights/<address>  ← the article, with "Read on Notion" if it is public
```

---

## One-time setup (about 15 minutes)

### 1. Create the connection in Notion

Notion calls integrations **connections**, and they live in the Developer portal.

1. Open Notion's Developer portal (`app.notion.com/developers/connections`) →
   **Connections** tab → **+ New connection**.
2. Name: `AF New Energy Website`. Authentication method: **API token**.
   Workspace: Faisal's workspace. **Create connection**.
3. On its **Configuration** tab, under Capabilities, tick **Read content**,
   **Insert content** and **Update content**. (Insert and Update are only needed
   for step 4. Turn them off afterwards.)
4. Copy the **Installation access token**.

> The token is a password to the workspace. It goes into Vercel and nowhere
> else: not the repo, not a screenshot, not a chat message.

### 2. Let the connection see the Website page

Open the **Website** page in Notion → **•••** (top right) → **Connections** →
**+ Add connection** → *AF New Energy Website* → Confirm.

Or in the Developer portal: the connection → **Content access** → **Edit
access** → tick Website.

### 3. Two variables in Vercel

Project → **Settings → Environment Variables**. Tick all three environments
(Production, Preview, Development) for each:

| Key | Value |
|---|---|
| `NOTION_TOKEN` | the Installation access token |
| `REVALIDATE_SECRET` | any long random password you make up |

Push the code (or redeploy). Until step 4, the Insights page keeps showing the
three sample articles from `src/content/samples`, so it is never empty.

### 4. Open the setup link once

```
https://afnewenergy.com/api/notion/setup?secret=YOUR_REVALIDATE_SECRET
```

It creates, inside the Website page:

- an **Insights** database with every column the site reads (each column has a
  description: hover its name in Notion)
- the three sample articles, published
- **✍️ Writing guide**: an unpublished page that shows every element and how
  to make it. Duplicate it to start a new article.

The Insights page switches to Notion straight away. The link is safe to open
again: once the database exists it only reports what is there. If a run was
interrupted, opening it again finishes the job. Adding `&samples=1` puts back
any sample article that was deleted.

### 5. Tidy up (optional)

Back in the Developer portal, set the connection's capabilities to **Read
content** only. The site never writes to Notion again.

---

## Writing and publishing

1. In **Insights**, click **New**, or duplicate the Writing guide.
2. Headline in the page title. One or two sentences in **Subtitle**.
3. Cover photo: hover the top of the page → **Add cover** → Upload.
4. Pick a **Topic**. Add **Tags** if useful.
5. Write the article (see the table below).
6. Tick **Published**. The site shows it within about five minutes.

To hide an article, untick Published. To change one, edit it and the site follows.

**Faster than five minutes:** open
`https://afnewenergy.com/api/revalidate?secret=YOUR_REVALIDATE_SECRET` and the
whole site refreshes at once. Bookmark it.

**"Read on Notion" button:** appears on an article when that page is public in
Notion: on the page, **Share → Publish → Publish to web**. Publish pages one at
a time; publishing the whole database would also expose unpublished drafts.

### What each Notion block becomes

| In Notion | On the website |
|---|---|
| Heading 1 | numbered section (01, 02…), listed in "On this page" |
| Heading 2, Heading 3 | sub-headings |
| Text, **bold**, *italic*, links | body text |
| Image | photo the width of the text |
| Image with caption `Wide: …` | photo that runs past the text into the margin |
| Image with caption `Small: …` | small photo, text wraps round it |
| `… | Photo: Name` at the end of a caption | photo credit on the right |
| Two or more images side by side (columns) | gallery |
| Callout containing a list | boxed summary: the callout's text is the label ("Key takeaways") |
| Quote, with `- Name` on its last line | large pull quote with attribution |
| Table (turn on Header row) | table; a line `Table 1 · …` just above it becomes its title. On phones each row becomes a labelled card |
| Numbered list | numbered rows with large figures |
| Bulleted list, to-do, toggle, divider, code | as you would expect |
| `/video` with a YouTube or Vimeo link | video player |
| Bookmark, PDF, file | link card |
| Heading **References** at the end, one numbered line per source with the title as a link | the References tab, plus a Cite tab. `[1]`, `[2]`… in the text link to those lines |

If an article uses no Heading 1, Heading 2 becomes the numbered level, either
habit works. Reading time is counted from the text.

### Columns in the Insights database

Only **Title** and **Published** are required.

| Column | What it does |
|---|---|
| Title | the headline |
| Subtitle | the line under the headline; also the card text and the Google description |
| Published | ticked = on the website |
| Date | publish date; sorts the list, newest first. Blank = the day the page was created |
| Topic | the coloured label above the headline |
| Tags | keywords at the end of the article |
| Type | Article, or Video |
| Video URL, Video minutes | only for Type = Video |
| Cover caption | caption under the cover; add ` | Photo: Name` for a credit |
| Slug | optional web address ending. Blank = made from the headline plus a short code, so the address keeps working even if the headline is edited later |
| Language | blank = English. Only for a translated copy: give it the same Slug as the English article and set Language, e.g. `zh`. Visitors on that language see the translation; everyone else keeps the English |

Don't rename **Title**, **Subtitle** or **Published**. The site finds the
database by its name or by those columns, so it can be moved within Notion.

---

## Photos

Upload photos straight into Notion: that is the easy way and it is supported.
Notion's own links to uploaded files expire after about an hour, so the site
never uses them directly: `/api/notion/img/…` asks Notion for a fresh link,
resizes the photo to the size the visitor needs, converts it to WebP and caches
it for a year. Replacing a photo in Notion gives it a new address, so the old
one is never shown.

Photos pasted as links (`/image` → Embed link) are used as they are.

---

## How it works

```
src/content/index.ts            the switch: Insights come from Notion whenever NOTION_TOKEN is set
src/content/notion/schema.ts    the database columns: used by the setup route and the reader
src/content/notion/insights.ts  finds the database, reads published rows, locale fallback, slugs
src/content/notion/render.ts    Notion blocks → article HTML, "On this page", references
src/content/notion/media.ts     which photos go through the relay
src/content/samples/            the sample articles and writing guide (used before setup, and by setup)
src/app/api/notion/setup/       the one-time setup link
src/app/api/notion/img/         photo relay (fresh link + resize + cache)
src/app/api/notion/file/        PDFs and other files (fresh link, redirect)
src/app/api/revalidate/         refresh now
src/components/insights/        list page (grid/list/pages/All) and the article's interactive parts
```

- **Refreshing.** Pages rebuild at most every five minutes when visited (ISR).
  Each article's blocks are cached by its last-edited time, so the list shows a
  real reading time without re-reading every article.
- **If Notion is down during a build,** the build uses the sample articles
  rather than failing. If Notion is down while the live site refreshes, visitors
  keep seeing the last good version.
- **Six languages.** Articles are written in English and shown on all six
  locales; the page chrome is translated. A translated row (above) replaces the
  English one for its language only. On the Arabic site an English article is
  laid out left to right.
- **API version.** `@notionhq/client` v5 with `Notion-Version: 2026-03-11`
  (`dataSources.query`, not the old `databases.query`).
- **Projects** still come from `src/content/local/projects.ts`. Moving them to
  Notion too is `CONTENT_SOURCE=notion` plus a Projects database: see
  `npm run notion:schema`.

Optional variables: `NOTION_INSIGHTS_DS` pins a specific data source id instead
of finding it automatically; `INSIGHTS_SOURCE=local` forces the samples even
when a token is set.

---

## When something looks wrong

| Symptom | Cause |
|---|---|
| Setup says "Wrong secret" | the `?secret=` value doesn't match `REVALIDATE_SECRET` in Vercel, or it was added without redeploying |
| Setup says it can't see a page called Website | step 2 was skipped |
| Setup says the connection isn't allowed to add content | tick Insert and Update content (step 1.3), then run it again |
| Insights still shows the samples after setup | wait a minute and refresh; check Vercel → Logs for `[content]` lines |
| A new article doesn't appear | Published not ticked, or less than five minutes, or open the refresh link |
| "Read on Notion" missing | that page isn't published to the web in Notion |
| A photo shows at the wrong size | check the caption starts with `Wide:` or `Small:` exactly |
| `unauthorized` in the logs | the token was regenerated: paste the new one into Vercel and redeploy |

Notion's API is free on every plan. The site stays well under its rate limit.

# Deploying to Vercel

The build needs **no environment variables at all** — I verified it: 133 pages
generate cleanly with an empty environment. So you can get a live URL first and
add the real values afterwards.

Pick **one** of the two paths below.

---

## ⚠ First: do not use the drag-and-drop uploader

Dragging a `.zip` or a folder onto vercel.com does **not** run a Next.js build.
Vercel treats the files as a static site, finds no `index.html`, and every URL
returns **404**. That is the 404 you saw before, not a bug in the code.

Use GitHub import or the CLI. Both run a real build.

---

## Path A — GitHub (recommended)

This is what Vercel is built around, and it gives you a preview URL for every
change — which is how we should review each round.

### 1. Unzip

```bash
unzip site.zip -d faisal-site
cd faisal-site
```

Check that `package.json` sits directly in this folder. If you see a nested
folder instead, move up or down one level until it does. **Vercel looks for
`package.json` at the repository root** — a wrapper folder is the second most
common cause of a 404.

### 2. Push to GitHub

Create an empty repo at github.com/new — **no** README, **no** .gitignore
(this project already has one). Then:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

If git asks for a password, use a **personal access token**, not your GitHub
password — github.com → Settings → Developer settings → Personal access tokens
→ Fine-grained → give it `Contents: read and write` on that repo.

### 3. Import on Vercel

1. vercel.com → **Add New → Project**
2. **Import** your repo
3. Leave every build setting alone. Vercel detects Next.js and fills in:
   - Framework: `Next.js`
   - Build command: `next build`
   - Output directory: `.next`
   - Install command: `npm install`
4. **Deploy**

First build takes roughly two to three minutes. You get a URL like
`your-repo.vercel.app`.

### 4. From then on

```bash
git add . && git commit -m "what changed" && git push
```

Every push to `main` deploys to production. Every push to any other branch gets
its own preview URL.

---

## Path B — Vercel CLI (no GitHub)

Faster for a throwaway test. No preview history, no automatic redeploys.

```bash
unzip site.zip -d faisal-site
cd faisal-site
npx vercel
```

It will ask:

| Prompt | Answer |
|---|---|
| Set up and deploy? | **Y** |
| Which scope? | your account |
| Link to existing project? | **N** |
| Project name? | `abdullah-faisal` (or anything) |
| In which directory is your code? | **`./`** ← press Enter |
| Modify build settings? | **N** |

That gives a preview URL. When you want the real one:

```bash
npx vercel --prod
```

---

## Environment variables

**Nothing is required for the first deploy.** Add these when you are ready, at
**Vercel → your project → Settings → Environment Variables**.

Tick all three boxes — **Production, Preview, Development** — for each one.
Forgetting Production is why a variable "works locally but not live".

### Add this one first

| Variable | Value | Why |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` | Canonical URLs, sitemap, hreflang, OG images. Without it these point at the preview URL, which confuses Google. |

**Include the `https://`.** A bare `your-domain.com` used to crash the build with
an opaque *"error occurred in the Server Components render"* on a random page.
The config now repairs a missing scheme, a trailing slash and odd casing
automatically — but the full origin is still the correct thing to enter.

`NEXT_PUBLIC_*` variables are **inlined at build time**, so changing this value
does nothing until you redeploy.

### For the contact form

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | `re_...` from resend.com → API Keys |
| `CONTACT_TO_EMAIL` | `faisal473345@gmail.com` |
| `CONTACT_FROM_EMAIL` | `website@your-domain.com` |

`CONTACT_FROM_EMAIL` must be on a domain you have **verified in Resend**
(Resend → Domains → Add). A Gmail address will not work as the sender. Until
these are set, the form returns a polite error and the direct email and WhatsApp
links still work.

### For instant content refresh

| Variable | Value |
|---|---|
| `REVALIDATE_SECRET` | any long random string |

Then `https://your-site.com/api/revalidate?secret=THAT_STRING` forces a rebuild
of all pages on demand.

### Only when moving to Notion

| Variable | Value |
|---|---|
| `CONTENT_SOURCE` | `notion` |
| `NOTION_TOKEN` | `ntn_...` |
| `NOTION_INSIGHTS_DS` | data source ID |
| `NOTION_PROJECTS_DS` | data source ID |

See `NOTION-SETUP.md`. Leave `CONTENT_SOURCE` unset (or `local`) for now.

**After changing any variable you must redeploy** — Vercel → Deployments → ⋯ on
the latest → **Redeploy**. Env vars are read at build time, not on the fly.

---

## Custom domain

1. Buy the domain anywhere (Namecheap, Cloudflare, GoDaddy…)
2. Vercel → your project → **Settings → Domains → Add**
3. Enter `abdullahfaisal.com`. Vercel shows the DNS records to create:

| Type | Name | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

Vercel displays the current values on that screen — **use those, not these**, in
case they change.

4. Add the records at your registrar. Propagation is usually minutes, up to 48
   hours worst case.
5. SSL is issued automatically. Vercel redirects `www` to the apex for you.
6. Update `NEXT_PUBLIC_SITE_URL` to the real domain and redeploy.

---

## If the build fails with a `digest` and no real message

```
Error occurred prerendering page "/en/about"
[Error: An error occurred in the Server Components render...] { digest: '...' }
```

Next.js hides the real message in production builds. Three ways to see it,
fastest first.

### 1. Run preflight

```bash
npm run preflight
```

It checks the things that produce exactly this error — a malformed
`NEXT_PUBLIC_SITE_URL`, `CONTENT_SOURCE=notion` without credentials, a missing
or unbalanced translation key, a missing asset. It also runs automatically
before every `npm run build`.

### 2. Build locally — the message is not masked

```bash
npm install
npm run build
```

Locally Next prints the actual error and the file it came from. This is the
single most useful thing to do, and it takes two minutes.

### 3. Read the Vercel log properly

The real error is usually **20–40 lines above** the digest block. In Vercel:
your project → **Deployments** → click the failed one → **Building** → scroll up
from the digest and look for the first `Error:` line.

Do not just read the tail of the log — the tail is the summary, not the cause.

---

## Check it worked

Replace `SITE` with your URL:

| Visit | Expect |
|---|---|
| `SITE/` | redirects to `SITE/en` |
| `SITE/ar` | Arabic, laid out right-to-left |
| `SITE/en/projects` | the project register |
| `SITE/sitemap.xml` | XML with all six locales |
| `SITE/robots.txt` | `Allow: /` on production |

Then click the **moon icon** in the header — light and dark should both look
deliberate. And open it on your phone.

If `SITE/` 404s but `SITE/en` works, the middleware did not deploy — check that
`src/middleware.ts` exists in the repo (not at the project root; that was the
earlier bug).

---

## After launch

1. **Google Search Console** — search.google.com/search-console → add your
   domain → Sitemaps → submit `sitemap.xml`
2. **Vercel Analytics** — project → Analytics → Enable (free, no cookie banner
   needed)
3. **Speed Insights** — project → Speed Insights → Enable

---

## Cost

| Item | Cost |
|---|---|
| Vercel Hobby | **$0** — plenty for this site |
| Resend | **$0** up to 3,000 emails/month |
| Notion API | **$0** on every plan |
| Domain | ~$12–15/year |

The only thing you pay for is the domain.

---

## Making Vercel build the code you just tested

If `npm run build` succeeds on your Mac but Vercel fails, Vercel is not building
the same thing. In order of likelihood:

1. **Vercel is on an older commit.** Deployments → click the failed one → check
   the commit hash and message against your latest `git log`. If they differ,
   push again.
2. **A stale build cache.** Deployments → ⋯ on the latest → **Redeploy** →
   **untick "Use existing Build Cache"** → Redeploy.
3. **An environment variable set in Vercel but not on your machine.** Settings →
   Environment Variables. Anything there that is not in your local `.env.local`
   is a difference between the two builds. `CONTENT_SOURCE=notion` without
   credentials is the one that breaks a build outright — delete it or set it to
   `local`.
4. **Node version.** Settings → General → Node.js Version → **22.x**.

---

## If something goes wrong

| Symptom | Cause |
|---|---|
| Every page 404s | Deployed as static files (drag-and-drop), or `package.json` is not at the repo root |
| `/` 404s but `/en` works | `src/middleware.ts` missing from the repo |
| Build fails on `next/font` | Transient Google Fonts fetch failure — just redeploy |
| Contact form returns an error | `RESEND_API_KEY` or `CONTACT_FROM_EMAIL` unset, or the sender domain is unverified in Resend |
| Sitemap shows `localhost` | `NEXT_PUBLIC_SITE_URL` not set in Production, or set but not redeployed |
| `Error occurred prerendering page` + `Server Components render` + a `digest` | Almost always a malformed `NEXT_PUBLIC_SITE_URL`. Now auto-repaired; if it persists, open the failing deployment → **Building** log and look for the line above the digest. |
| Images broken after a day | Notion-hosted file URLs expired — use the `Cover URL` property instead (`NOTION-SETUP.md`, step 6) |
| Preview URL appearing in Google | It shouldn't — `robots.ts` blocks previews. Check `VERCEL_ENV` is `preview` on that deployment. |

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Next.js dev server (http://localhost:3000)
npm run build    # Production build
npm start        # Serve the production build
npm run lint     # next lint (eslint-config-next)
```

There is no test suite. Production is **Vercel**, served at `https://register.ipmcareer.com`.
Secrets live in `.env.local` (template + full var list in `.env.example`).

## What this is

The full marketing + student-tooling site for **IPM Careers**, an IPMAT/IPM (BBA at
the IIMs) coaching brand. Despite the repo name "landing-page", this is a large
**Next.js Pages Router** app (`next ^16`, React 18) that bundles: city landing
pages, a lead-capture funnel, a content/blog + news system, an AI score predictor,
Personal-Interview (PI) prep with payments, admit-card/scorecard/report tools, and
a Gemini voice assistant.

## Stack & conventions

- **Pages Router only** — routes live in `pages/`, APIs in `pages/api/`. There is
  **no `src/` or App Router**.
- **Mostly JavaScript** (`.js`/`.jsx`) with some TypeScript (`.tsx`/`.ts`).
  `tsconfig.json` has `strict: false` and `allowJs` — don't assume type safety.
- **No path alias** is configured. Use relative imports (`../utils/...`,
  `../../lib/...`), matching existing files.
- **Styling**: Tailwind CSS **v3** (`tailwind.config.js`) + per-page/component CSS
  Modules (`*.module.css`) + NextUI + framer-motion. Global CSS in
  `styles/globals.css`. Fonts: Poppins via Google Fonts, Sk-Modernist self-hosted.
- `/` is rewritten to `/home` (in **both** `next.config.js` `beforeFiles` and
  `vercel.json` — keep them in sync). The homepage UI is `pages/home/index.tsx`;
  note `components/index.js` is also a legacy `Home` component.

## Architecture

### Data layer — Supabase (two clients, do not mix up)
- `utils/supabaseClient.js` — exports `supabase` (public anon key, browser-safe,
  respects RLS) and `getSupabaseServer()` / `supabaseServer` (service-role, lazy,
  **server-only**, `null` in the browser).
- `lib/supabaseAdmin.js` — `supabaseAdmin`, also service-role.
- **Service-role keys bypass Row Level Security.** Only use `getSupabaseServer()` /
  `supabaseAdmin` inside `pages/api/*` or `getServerSideProps`, never in client
  code. Some API routes also `createClient(...)` inline — same rule applies.
- Supabase tables seen in code: `blogs`, `responses`, `college_cutoffs`, exam
  notification subscribers. `supabase_exam_notifications.sql` holds related schema.

### Lead funnel (the original "landing page")
City landing pages — dynamic `pages/[city].js` plus dedicated `pages/bangalore.js`,
`pages/indore.js`, `pages/new-delhi.js` — render a registration form. The big
state→cities list is `utils/cities.js`. Submissions fan out to integrations via
API routes: `pages/api/salesforce-lead.js` (Salesforce OAuth + lead create),
`pages/api/interakt.js` / `sendWhatsApp.js` (WhatsApp), `pages/api/tcy.js` (TCY
Online), plus Cronberry triggers (`NEXT_PUBLIC_CRONBERRY_PROJECT_KEY`).

### Content automation (AI blog + news)
- `pages/api/generate-blog.js` (Gemini `gemini-2.5-pro`) and
  `pages/api/aggregate-news.js` (`gemini-2.5-flash`) are **gated by a bearer
  token** — `lib/auth.js#requireAuth` checks `CONTENT_AUTOMATION_TOKEN`. These are
  driven by scheduled tasks, not interactive users.
- Supporting libs: `lib/gemini.js` (dependency-free fetch wrapper with retry +
  model fallback), `lib/humanize.js` (regex pass that strips AI "tells" from
  generated prose), `lib/markdown.js` (`marked` + internal-link injection),
  `lib/feeds.js` (vetted RSS sources + a **competitor-domain blocklist** — respect
  it), `lib/gradients.js` (category ordering used across blog/news).
- Published blogs render under `/magazine/*`; the **dynamic** `pages/sitemap.xml.js`
  pulls published slugs from the `blogs` table on each request. `/blogs/*` is a
  separate legacy file-based system (`content/blogs/*.md`).

### Other product surfaces
- **Predictor**: `pages/api/predictor.js` scores a student against
  `college_cutoffs` (SA/QA/VA totals) for IPMAT Indore calls.
- **PI prep** (`pages/pi/*`): Razorpay payments (`pages/api/pi/create-order.js`,
  `verify-payment.js`), AI mock interviews + SOP review (OpenAI/Gemini).
- **Admit card / scorecard / report**: `pages/admit/*`, `pages/scorecard/*`,
  `pages/report/*`; PDF generation via `@react-pdf/renderer` and
  `pages/api/generateReportPDF.js` (configured for 30s / 1GB in `vercel.json`).
- **Voice assistant**: `VoiceWidget` (loaded client-only in `pages/_app.js`) uses
  the Gemini Live API — `hooks/useLiveAPI.ts`, `lib/vivek-gemini.ts`. This path
  uses `NEXT_PUBLIC_GEMINI_API_KEY` (exposed client-side) — distinct from the
  server-only `GEMINI_API_KEY` used by content automation.

### Email
Transactional/marketing email goes through **multiple SMTP providers** configured
in env: primary `mail.ipmcareer.com`, Zoho, and ZeptoMail, sent via `nodemailer`
from various `pages/api/send*.js` routes.

### Cross-cutting (`pages/_app.js`, `pages/_document.js`)
Global providers: NextUI, smooth-scrollbar, `AuthProvider` (`hooks/useAuth.js`),
react-hot-toast, Vercel Analytics. Tracking is wired here: GTM, Google Ads gtag,
and a Facebook Pixel — events push to `window.dataLayer`.

### SEO
- `pages/robots.txt.js` and `pages/sitemap.xml.js` are **dynamically generated**
  via `getServerSideProps` — there is no static file in `public/`. Both hard-code
  the canonical host `https://register.ipmcareer.com`.
- `vercel.json` holds redirects, the `/api/*` CORS headers, the per-function
  overrides, and a daily cron hitting `/api/send-exam-alerts` (07:00 UTC).

## Gotchas
- Service-role Supabase keys must never reach the client (see Data layer above).
- Two GEMINI keys with different scopes (`GEMINI_API_KEY` server vs
  `NEXT_PUBLIC_GEMINI_API_KEY` client) — pick the right one for the context.
- `/` → `/home` rewrite is duplicated in two config files; change both.
- Content-automation endpoints will 401 without the `CONTENT_AUTOMATION_TOKEN`
  bearer header.

# bmorozovcom

Personal site for Bohdan Morozov — Next.js App Router, server-rendered by default.

## Develop

```bash
pnpm dev     # http://localhost:3000
pnpm build
pnpm lint
```

## Deploy

The app ships as a container. Each app owns its `Dockerfile`, but the build
context is the repo root, so run it from there:

```bash
docker build -f apps/web/bmorozovcom/Dockerfile -t bmorozovcom .
docker run -p 3000:3000 bmorozovcom
```

Every `COPY` in the Dockerfile is root-relative for that reason. The app is
flattened into `/app` in the image rather than reproducing its path, and the
root `.dockerignore` keeps `node_modules` and `.next` out of the context.

Multi-stage build on `node:22-alpine`: dependencies, `next build`, then a
runtime stage carrying only `.next/standalone` (`output: "standalone"`) plus
`.next/static` and `public/`. Runs as a non-root user on port 3000 — override
with `PORT` and `HOSTNAME`. Image is ~295MB.

## Analytics

Amplitude (`@amplitude/unified`, `initAll`), initialised once in
`src/instrumentation-client.ts`. Needs `NEXT_PUBLIC_AMPLITUDE_API_KEY` at build
time — CI passes it from the `AMPLITUDE_API_KEY` repository variable, locally it
comes from `.env.local` (gitignored). A build without it logs a warning and
sends nothing. The projects are US-hosted; `AMPLITUDE_SERVER_ZONE` stays `US`.

One Amplitude project per environment, so test traffic never reaches
production data (Amplitude can't easily delete ingested events):

| Environment | Amplitude project | Key comes from |
|---|---|---|
| Local | dev | `.env.local` |
| Test (future) | dev | a `test` GitHub Environment variable `AMPLITUDE_API_KEY` |
| Production | prod | the `AMPLITUDE_API_KEY` repository variable |

Sites on other subdomains (e.g. `tool.bmorozov.com`) need no setup: every event
carries `[Amplitude] Page Domain`. Every event also carries `app_version`, the
deployed commit (the same short SHA as the site footer).

No cookies or localStorage (`identityStorage: "none"`), and Session Replay is
off (`sampleRate: 0`) since it buffers recordings on the device. Set
`NEXT_PUBLIC_AMPLITUDE_DEBUG=true` to log every event to the console.

Amplitude attaches the context, so our events don't:

- **Autocapture** — page views (client-side navigations included), attribution
  (UTM, referrer, referring domain as user properties), sessions.
- **Page URL enrichment** — page path, URL, title and the previous page
  (`internal` / `external` / `direct`) on every event.
- **Server-side** — country, region and city from the IP; device, OS and
  browser from the user agent.

Our events carry only what Amplitude can't infer:

| Event | Properties |
|---|---|
| `contact_clicked` | `type`, `action` (`open` or `copy`) |
| `cv_downloaded` | `cv_version` |
| `project_clicked` | `project`, `destination` (`project_page`, `live_site`, `architecture_diagram`, `stats` or `source`), `url` |
| `architecture_diagram_viewed` | `project` |

Click events are declared with `trackClick()` from
`src/lib/analytics-events.ts` and sent by one delegated listener, so tracked
links stay server components. View events use `<TrackView>`.

## Stats page

`/projects/<slug>/stats` (projects with `stats: true`) reads this site's own
Amplitude events back through the Dashboard REST API and draws them — page views,
CV downloads and contact clicks per channel (copying the email address counts as
an email click). Hourly for the last 24 hours, the default; daily for 7, 30 and
90 days. Queries run on the server (`src/lib/amplitude-api.ts`, `server-only`); the page
renders per request for the chosen range.

Freshness is set by Amplitude, which caches query results itself: about 5
minutes for hourly queries, an hour for daily up to 7 days, 6 hours up to 30,
18 hours up to 180. The "Last 24 hours" range uses hourly buckets for near-live
numbers, and the page states each range's freshness. Our own cache sits under
Amplitude's (60 seconds hourly, 5 minutes daily) — polling faster only spends
rate limit.

It needs the project's **secret key** at runtime as `AMPLITUDE_SECRET_KEY`, plus
the API key above. Without them the page says stats aren't connected.

- **Production** — managed as the `AMPLITUDE_SECRET_KEY` GitHub Actions secret.
  Each deploy writes it to Parameter Store (`/bmorozovcom/amplitude-secret-key`,
  encrypted); the instance reads it from there when starting the container, so
  the value never appears in the SSM command or its history, and it's never
  baked into the image. Terraform grants the deploy role write access and the
  instance read access to that one entry.
- **Local** — `AMPLITUDE_SECRET_KEY` in `.env.local` (dev project).

## Structure

```
src/
  app/                  routes (layout.tsx, page.tsx per segment)
  app/icon.tsx          favicon + Apple icon, generated from the initials
  components/about/     homepage stat tiles
  components/analytics/ <TrackView> for page-view events
  components/contact/   contact channels, languages
  components/layout/    site shell: header, nav, footer
  components/projects/  project cards and chips
  components/stats/     stats page: tiles, column chart, range picker
  components/ui/        presentational primitives
  config/site.ts        identity and CV
  config/navigation.ts  main nav items
  config/about.ts       homepage stats
  config/contact.ts     contact channels and languages
  config/projects.ts    project entries
  content/projects/     long-form write-up per project page
  lib/                  helpers, analytics events, Amplitude read client
  instrumentation-client.ts  Amplitude init + click listener
public/
  cv/                   the published CV
  projects/             project screenshots and diagrams
```

Everything renders on the server except `components/layout/site-nav.tsx` (needs
the active route segment to mark the current link) and
`components/ui/copy-button.tsx` (clipboard). Routes are added by creating a
folder under `src/app/` and listing it in `mainNav` in
`src/config/navigation.ts`; `typedRoutes` keeps every `href` type-checked.

"About me" is the index route (`src/app/page.tsx`) — the text logo is a link to
it, not a page of its own.

## Content

No CMS: everything that changes between deploys lives in `src/config/`, one file
per kind of content.

- **New CV** — add it to `public/cv/` with a date-stamped name
  (`CV_Bohdan_Morozov_YYYY-MM.pdf`), point `cv.href` at it, bump `cv.updated`,
  and delete the old file. A new name means a new URL, so Cloudflare and
  browsers can't serve the old one from cache. `bmorozov.com/cv` and the
  original `/cv/CV_Bohdan_Morozov.pdf` redirect to whatever `cv.href` is.
- **New project** — add an entry to `projects` and put its screenshot in
  `public/projects/`.
- **Stats, contact details, languages** — `about.ts` and `contact.ts`.

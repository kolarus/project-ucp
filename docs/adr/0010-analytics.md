# 0010. Analytics: Amplitude, no device storage, public stats page

- Status: accepted
- Date: 2026-09-30 (recorded retroactively; in effect since 2026-09-23)
- Scope: bmorozov.com
- Related: ADR-0005 (secrets), ADR-0009 (structure)

## Context

bmorozov.com is a portfolio: it's worth knowing which projects people open,
whether the CV gets downloaded and which contact channel they use. The site
also shows its own numbers on a public stats page, as part of the project. A
cookie consent banner would be out of proportion for a personal site, and
analytics must never break a page.

## Decision

- **Amplitude** (`@amplitude/unified`), initialised once in
  `src/instrumentation-client.ts`, before the app hydrates. Without an API key
  (local builds, forks) nothing loads and nothing is sent.
- **Amplitude supplies the context; our events carry only what it can't
  infer.** Autocapture covers page views, sessions and attribution, and page
  URL enrichment adds the page and the previous page to every event. Four
  explicit events (`contact_clicked`, `cv_downloaded`, `project_clicked`,
  `architecture_diagram_viewed`) carry which contact, CV or project.
- **Tracked links stay server components.** Click events are declared as data
  attributes with `trackClick()` and sent by one delegated listener; view
  events use `<TrackView>`. Both live in `shared/analytics`, the only place
  besides `instrumentation-client.ts` that may import the SDK.
- **Nothing is stored on the visitor's device** (`identityStorage: "none"`) and
  Session Replay is off, so no consent banner is needed. Every visit counts as
  new.
- **One Amplitude project per environment** (dev locally, prod in production),
  so test traffic never reaches production data. Every event carries the
  deployed commit as `app_version`.
- **The public stats page reads the numbers back on the server**, through
  Amplitude's Dashboard REST API with the project's secret key (`server-only`,
  delivered through Parameter Store, ADR-0005). `shared/api` holds the client;
  `entities/site-stats` decides which events and ranges. Our cache sits just
  under Amplitude's own query cache, and the page says how fresh each range
  is. It shows event counts, not visitors, since visits can't be linked.

## Alternatives considered

- **Google Analytics.** Needs cookies and therefore consent, and data sharing
  with ad products.
- **Self-hosted Plausible or Umami.** Privacy-friendly, but another service to
  run and back up on the single host (ADR-0004).
- **Vercel Analytics.** Tied to Vercel hosting.
- **Cookies for returning-visitor counts.** Would need a consent banner for a
  number that doesn't matter here.
- **A client component per tracked link.** Ships JavaScript for every link;
  the delegated listener keeps them server-rendered.

## Consequences

Positive:

- No consent banner, no device storage, and a site that works without
  analytics.
- The stats page doubles as a demonstration of the pipeline.

Negative / accepted costs:

- No returning-visitor or unique-visitor numbers.
- The browser SDK is the largest part of every page's JavaScript.
- Amplitude's query cache bounds how fresh the stats page can be.

## Enforcement

- `no-restricted-imports`: the SDK only in `shared/analytics` and
  `instrumentation-client.ts`; `no-restricted-globals`: `fetch` only in
  `shared/api` (ADR-0009).
- `server-only` in `shared/api` and `entities/site-stats`' server code.
- Unit tests for the range parameter and for reading Amplitude's responses
  (ADR-0008).

## References

- `apps/web/bmorozovcom/README.md` (Analytics, Stats page): event table,
  environments, freshness, setup
- `apps/web/bmorozovcom/src/shared/analytics/`, `src/shared/api/`,
  `src/entities/site-stats/`, `src/instrumentation-client.ts`

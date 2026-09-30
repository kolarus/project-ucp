# 0003. Web stack: Next.js App Router, strict TypeScript, Tailwind, server-first

- Status: accepted
- Date: 2026-09-30 (recorded retroactively; in effect since 2026-09-17, Node
  version decided 2026-09-30)
- Scope: monorepo
- Related: ADR-0002 (workspace), ADR-0004 (hosting)

## Context

Every web app in the repository is a content-heavy site that must be fast,
indexable and able to keep secrets on the server (analytics reporting keys; in
jobs.bmorozov.com, user data and auth). One stack for all apps means one set of
skills, tooling and deployment. The apps are self-hosted in containers
(ADR-0004), so the stack must build to a standalone Node server.

## Decision

- **Next.js with the App Router** (16.x), **React 19**, **TypeScript** with
  `strict: true`.
- **Server-first rendering.** Pages are prerendered at build time. A page
  renders per request only when it needs request data, as the stats page does
  with its date range. Client components (`"use client"`) only where the
  browser is required: interaction state, clipboard, analytics.
- **Secrets never reach the browser.** Modules that read secrets import
  `server-only`, so importing them into client code fails the build. Only
  values that are public by design use `NEXT_PUBLIC_*`.
- **Tailwind CSS v4** for styling, through `@tailwindcss/postcss`; conditional
  classes through a `cn()` helper; theme colours as CSS custom properties.
- **Typed routes** (`typedRoutes: true`): an internal link to a route that
  doesn't exist is a type error.
- **Standalone output** (`output: "standalone"`): the build emits a minimal Node
  server, which is what the container runs.
- **Fonts** through `next/font`, self-hosted at build time, with no requests to
  a font CDN at runtime.
- **Node 24 LTS** everywhere: local, CI and images. Rolled out 2026-09-30
  (amendment below).
- **Next.js 16 differs from older versions** in APIs and conventions. Read the
  docs bundled in `node_modules/next/dist/docs/` before relying on memory; each
  app's `AGENTS.md` carries Next's own note on this.

## Alternatives considered

- **Next.js Pages Router.** Legacy. The App Router's server components keep
  secrets and data fetching on the server by default.
- **A static site generator (Astro, Eleventy).** Enough for bmorozov.com alone,
  but jobs.bmorozov.com needs auth, per-user data and server logic. One stack
  for both wins.
- **Remix / React Router framework mode.** A credible alternative. Next.js was
  already in use, and its standalone output and typed routes fit the setup.
- **A client-side SPA (Vite + React).** Weaker for indexing and first paint, and
  secrets would need a separate backend.
- **CSS Modules or CSS-in-JS** instead of Tailwind. Tailwind keeps styles next
  to markup without extra files; runtime CSS-in-JS conflicts with server
  components.
- **Node 22** (what the images ran until 2026-09-30). Supported until April
  2027. Node 24
  is the current LTS with the longest support window, and a single version
  everywhere removes local/production differences.

## Consequences

Positive:

- Most pages are static HTML: fast, cacheable, and cheap to serve from one small
  host.
- Secrets and data access stay on the server by construction.
- Broken internal links and type errors fail the build.

Negative / accepted costs:

- Next.js releases change APIs often; upgrades need the bundled docs and care.
- The server/client boundary is easy to get wrong. It's guarded by `server-only`
  and by keeping client components few.

## Enforcement

- `next build` type-checks (strict mode, typed routes); `server-only` fails the
  build when secret-reading code is imported from client code.
- Next 16's `next build` no longer lints, so lint runs in `pnpm validate`: in
  the pre-push hook and in CI before every deploy (ADR-0007, ADR-0005).

## References

- `apps/web/*/next.config.ts`, `apps/web/*/tsconfig.json`
- `node_modules/next/dist/docs/` (Next.js 16 documentation, bundled)
- https://nodejs.org/en/about/previous-releases

## Amendment 2026-09-30: Node 24 rolled out; stricter TypeScript

- **Node 24 LTS is pinned:** `.nvmrc`, `engines` in the root `package.json`
  (`>=24 <25`) and `engineStrict` in `pnpm-workspace.yaml`, so installing on any
  other Node fails instead of warning; `node:24-alpine` in both images. The
  Playwright image used for visual snapshots runs Node 24 too (ADR-0008). This
  completes the rollout noted under Decision.
- **TypeScript settings come from `@project-ucp/tsconfig`** (`nextjs.json` for
  apps, `base.json` for repository scripts). On top of `strict`:
  - `noUncheckedIndexedAccess`: an index into an array or record may be
    `undefined`, and the code has to handle it;
  - `allowJs: false`: source is TypeScript only.
- **Lint runs in `pnpm validate`**, with warnings failing (ADR-0007).

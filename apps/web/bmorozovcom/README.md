# bmorozovcom

Personal site for Bohdan Morozov — Next.js App Router, server-rendered by default.

## Develop

```bash
pnpm dev     # http://localhost:3000
pnpm build
pnpm lint
```

## Structure

```
src/
  app/                  routes (layout.tsx, page.tsx per segment)
  components/layout/    site shell: header, nav, footer
  components/ui/        presentational primitives
  config/site.ts        site metadata + nav items (single source of truth)
  lib/                  helpers
```

Everything renders on the server except `components/layout/site-nav.tsx`, which
needs the active route segment to mark the current link. Routes are added by
creating a folder under `src/app/` and listing it in `mainNav` in
`src/config/site.ts`; `typedRoutes` keeps every `href` type-checked.

"About me" is the index route (`src/app/page.tsx`) — the text logo is a link to
it, not a page of its own.

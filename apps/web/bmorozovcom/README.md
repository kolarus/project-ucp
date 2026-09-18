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
  components/contact/   contact channels, languages
  components/projects/  project cards
  components/ui/        presentational primitives
  config/site.ts        identity, location, CV
  config/navigation.ts  main nav items
  config/contact.ts     contact channels and languages
  config/projects.ts    project entries
  lib/                  helpers
public/
  cv/                   the published CV
  projects/             project screenshots
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

- **New CV** — drop the file into `public/cv/`, point `cv.href` at it and bump
  `cv.updated`.
- **New project** — add an entry to `projects` and put its screenshot in
  `public/projects/`.
- **Contact details, languages, location** — `contact.ts` and `site.ts`.

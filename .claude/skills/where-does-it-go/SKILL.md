---
name: where-does-it-go
description: Decide where new or moved code belongs in a Next.js app's layered src/ (app → views → features → entities → shared) and scaffold it with the right entry points. Use before adding a component, page, data file, API call or helper to apps/web/*, when a lint boundary error says an import isn't allowed, or when the user asks where something should live.
---

# where-does-it-go

Places code according to
[ADR-0009](../../../docs/adr/0009-layered-structure.md). Read it if anything
below is unclear; it's binding.

## 1. Pick the layer

Ask in order and stop at the first yes:

| Question | Layer | Example |
|---|---|---|
| Would another app use it unchanged, with no domain knowledge? | `shared/<segment>` | a button, `cn()`, the Amplitude API client |
| Is it a business *thing*: data, types, mapping, reads, how it looks? | `entities/<noun>` | `project`, `contact-channel`, `site-stats` |
| Is it something the user *does*? | `features/<verb-noun>` | `download-cv`, `copy-contact` |
| Does it put together one page, and load that page's data? | `views/<page>` | `project-stats`, `site-shell` |
| Is it a route, layout or other Next.js file? | `app/` | `app/projects/[slug]/page.tsx` |

`shared` segments are fixed: `ui`, `lib`, `config`, `api`, `analytics`. A new
one needs an ADR-0009 amendment.

## 2. Pick the segment inside the slice

- `ui/`: components (`"use client"` only here, and only if the browser is
  needed)
- `model/`: types, data, mapping
- `api/`: data access (server-only code imports `server-only`)
- `lib/`: helpers for this slice
- `content/`: long-form write-ups (entities only, ADR-0011)

The slice root holds only entry points. Tests sit next to their code as
`<module>.test.ts`, and only for critical paths
([ADR-0008](../../../docs/adr/0008-testing-strategy.md)).

## 3. Expose it

- `index.ts`: what other slices may use. Export only what's used elsewhere;
  knip flags the rest.
- `server.ts`: anything that imports `server-only` (secrets, server reads).
  Never re-export server code from `index.ts`.
- `client.ts`: browser-only code for `instrumentation-client.ts`; rare.

## 4. Import it

- From another slice: `@/<layer>/<slice>` (its `index.ts`) or
  `@/<layer>/<slice>/server`. Never a path past the entry point.
- Inside the slice: relative paths.
- Only downward. If two slices in the same layer need each other, don't import
  sideways: let the layer above compose them, pass data as props, or add a slot
  prop (`entities/contact-channel`'s `accessory` takes `features/copy-contact`).

## 5. A new page

1. `views/<page>/ui/<page>-view.tsx`: the page's markup and data loading, plus
   its metadata (`<page>Metadata`, or a function taking the params) and, for
   dynamic routes, `<page>Params()`.
2. `views/<page>/index.ts`: export those.
3. `app/<route>/page.tsx`: a few lines. Read params, render the view, re-export
   metadata. `dynamicParams` must be written literally in the route file.
4. A line in the app's `tests/visual/pages.spec.ts`, then
   `pnpm test:visual:update` for the new baselines.

## Check

`pnpm validate`: `boundaries/dependencies` and `boundaries/no-unknown-files`
lint errors, and `check-architecture`, say what's out of place. Don't silence
them with `eslint-disable`; move the code.

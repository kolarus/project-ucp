# 0009. Layered feature-sliced structure for Next.js apps

- Status: accepted
- Date: 2026-09-30
- Scope: monorepo
- Related: ADR-0003 (web stack), ADR-0007 (validation), ADR-0008 (testing)

## Context

bmorozov.com grew by file type: `components/`, `config/`, `content/`, `lib/`,
with pages in `app/` holding up to 160 lines of data loading and markup. Where
new code belongs was a judgement call each time, nothing stopped a component
from reaching into any other file, and server-only code (Amplitude's secret
key) sat one import away from client components. jobs.bmorozov.com is next and
will be larger: auth, user data, several features. The owner's React Native app
(RepoScout) uses Feature-Sliced Design with lint-enforced layers, and it works.

## Decision

**Every Next.js app's `src/` is split into five layers.** A layer imports only
the layers below it:

```
app → views → features → entities → shared
```

| Layer | Holds | bmorozov.com examples |
|---|---|---|
| `app` | **Routing and wiring only**: Next's route files (`page`, `layout`, `not-found`, metadata files), global CSS. A `page.tsx` reads params and renders one view. | `app/projects/[slug]/stats/page.tsx` |
| `views` | One slice per page: puts features and entities together and loads the page's data (server components). Plus `site-shell`, the header, nav and footer. | `views/project-stats`, `views/site-shell` |
| `features` | Things the user **does**, named verb-noun. | `download-cv`, `copy-contact`, `pick-stats-range` |
| `entities` | Business **things**: their data, types, reads and how they look. | `project`, `contact-channel`, `site-stats`, `cv`, `profile` |
| `shared` | Code with no domain knowledge that another app could use unchanged. Its folders are segments: `ui`, `lib`, `config`, `api`, `analytics`. | `shared/ui`, `shared/api` (Amplitude client) |

**Rules:**

1. **Imports go down only.** Slices in the same layer never import each other.
   `shared` segments may import each other.
2. **Public API only.** Other code imports a slice through its entry points,
   never its internals; inside a slice, imports are relative. Entry points:
   - `index.ts`: safe to import anywhere;
   - `server.ts`: server-only code (`import "server-only"`: secrets, Amplitude
     reads). Keeping it out of `index.ts` means a client component importing a
     slice can't pull server code into the browser bundle;
   - `client.ts`: browser-only code (`shared/analytics`, the Amplitude SDK), for
     Next's `instrumentation-client.ts` only; no layer imports it.
3. **Entry points only at the slice root**, no nested barrels; no import cycles.
4. **Move up, never sideways.** When two slices need each other, the layer above
   puts them together: by passing data as props, or through a **slot**. The
   contact card (`entities/contact-channel`) has an `accessory` slot, and
   `views/contact` puts `features/copy-contact` into it.
5. **`"use client"` only in `ui/` files** (and `shared/analytics`): the smallest
   component that needs the browser. Route files, views' data loading, `model`,
   `api` and `lib` stay on the server, and a client file never imports a
   `server.ts`.
6. **`app/` holds Next's route files and nothing else**: no private folders, no
   components or helpers next to routes. Next's own files at the `src/` root
   (`instrumentation-client.ts`) are wiring outside the layers.

**Inside a slice:** the root holds only its entry points; code sits in
segments: `ui/` (components), `model/` (types, data, mapping), `api/` (data
access), `lib/` (helpers), and `content/` for long-form write-ups (ADR-0011).
File and folder names are kebab-case. The few tests sit next to the code they
guard (ADR-0008).

**Every app's `package.json` declares `"sideEffects": ["*.css"]`.** It tells the
bundler that importing a module has no effect beyond its exports, so it skips
the re-exports a page doesn't use. Without it, a barrel costs every page that
imports it all the client code behind it. On bmorozov.com the stats page
shipped `next/image` because it imported project data from
`entities/project`, whose `index.ts` also exports the project card. Modules in
`src/` therefore mustn't rely on import side effects; CSS is the exception.

**Imports use one alias per layer:** `@/views/*`, `@/features/*`,
`@/entities/*`, `@/shared/*`. There's none for `app`, so nothing can import it.

**Where does it go?**

1. Would another app use it unchanged? → `shared/<segment>`
2. Is it a business *thing* (data, mapping, how it looks)? → `entities/<noun>`
3. Is it something the user *does*? → `features/<verb-noun>`
4. Does it put together one page? → `views/<page>`
5. Is it a route or global wiring? → `app/`

**Code shared between apps moves to `packages/` only when a second app needs
it unchanged.** Moving earlier means guessing an API before there's a second
user; since `shared` has no domain knowledge by rule, the later move is
mechanical.

**How this differs from RepoScout:** the page layer is `views`, because Next
reserves `pages/` for its older router. Next's `app/` is the `app` layer: in a
web app, routing *is* the wiring. `server.ts` and `client.ts` are new, for
Next's server/client boundary.

## Alternatives considered

- **Folders by file type** (the previous layout). Simple at first, but nothing
  says where code belongs or what may import what, and pages accumulate logic.
- **Components colocated with routes** (`app/projects/_components/`). Next
  supports it, but code shared by two routes has no obvious home, and `app/`
  mixes routing with everything else.
- **Full Feature-Sliced Design** with `widgets` and `processes` layers. More
  layers than two small apps need. A `widgets` layer can come later if several
  pages share large blocks.
- **A workspace package per feature.** Strong boundaries, but heavy tooling
  for small apps; lint gives the same boundaries within one package.

## Consequences

Positive:

- Every file has one obvious place, and lint says when an import crosses a
  line it shouldn't.
- Route files are a few lines; a page's data and markup live in its view.
- Server-only code is visible at the import site (`…/server`), so it can't
  quietly reach a client bundle.
- jobs.bmorozov.com starts under the same rules.

Negative / accepted costs:

- More files and folders: a slice with one component still has an `index.ts`.
- Page metadata and static params are exported by the view and re-exported by
  the route file. Next needs `dynamicParams` literally in the route file.
- Barrels depend on `sideEffects` being declared; `check-architecture` makes
  sure it is.
- Deciding between entity and feature is a judgement call; review catches
  mistakes that lint can't.

## Enforcement

| Mechanism | Enforces |
|---|---|
| `eslint-plugin-boundaries` (`@project-ucp/eslint-config`) | layer direction, no imports between slices of a layer, imports only through `index.ts` / `server.ts`, no file outside the layers |
| `import/no-cycle` | no cycles |
| `no-restricted-imports`, `no-restricted-globals` | the Amplitude SDK only in `shared/analytics`; `fetch` only in `shared/api` |
| `scripts/check-architecture.mts` (in `pnpm validate`) | known layers and segments; entry points only at slice roots; every slice has `index.ts` or `server.ts`; no empty slices; kebab-case; `app/` holds only route files; `"use client"` placement; no `server.ts` import from a client file; TypeScript only; every app declares `sideEffects` |
| TypeScript paths | one alias per layer; `app/` can't be imported |
| `AGENTS.md`, the `where-does-it-go` skill | the placement guide for agents |

## References

- `apps/web/bmorozovcom/src/`, `packages/eslint-config/nextjs.mjs`,
  `scripts/check-architecture.mts`
- https://feature-sliced.design
- `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`

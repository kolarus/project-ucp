---
name: web-review
description: Review the Next.js apps for what lint, types, tests and screenshots can't catch (logic in route files, domain code in shared, server/client mistakes, missing page states, accessibility, analytics and content rules, docs drift), against the binding ADRs. Use at the end of a phase, before a release, when reviewing a diff, or when the user asks for a review. Outputs verified findings with file:line, severity and a fix.
---

# web-review

Reviews code in `apps/web/*` against the **binding ADRs**
([docs/adr/](../../../docs/adr/README.md)), covering only what the tooling
can't see.

## Scope

- **Change** (default): the working tree and recent commits, `git status` plus
  `git diff` against the last pushed commit.
- **Full** (end of a phase, before a release): every app's `src/`, its
  `public/`, `next.config.ts`, Dockerfile, the workflows, `scripts/` and the
  docs.

## Ground rules

1. **Start from green.** Run `pnpm validate` first. Don't report what it
   already enforces: types, lint (layer boundaries, cycles, the analytics SDK
   and `fetch` confined, React and Next rules), formatting, `check-docs`,
   `check-architecture`, knip, the unit tests. If something visible changed,
   `pnpm test:visual` covers it.
2. **Every finding cites a rule**: an ADR, `AGENTS.md`, or a real bug. If code
   and an ADR disagree, that's the finding; the fix is the code, or a
   superseding ADR (`adr-new`).
3. **Verify before reporting.** Read the code, its caller and, for routes, the
   rendered page. If you can't point at a line and say what goes wrong for a
   visitor or the next developer, drop it. Fewer, real findings beat a long
   list.
4. **Severity:**
   - **blocker**: a leaked secret, a broken page, lost data, or a shipped ADR
     violation.
   - **major**: a user-visible defect, a missing empty or error state, a
     server/client mistake that ships code or data to the browser needlessly.
   - **minor**: maintainability, docs drift, a missing critical-path test.
   - **nit**: wording, naming.

## Checklist

Each item names its ADR. Search hints are starting points; confirm by reading.

**Structure (ADR-0009)**

- Logic in route files: an `app/**/page.tsx` doing more than reading params and
  rendering one view (data loading, mapping, markup).
- Domain knowledge in `shared`: project names, contact types, business rules.
  `shared` must be usable unchanged by another app. (The analytics event list
  in `shared/analytics` is the recorded exception.)
- Ways around the layer rules: a feature's function passed down as a prop to
  reach sideways (a rendered element in a slot prop is fine); `shared`
  re-exporting a slice.
- Business mapping in a view that belongs in an entity; an entity that is
  really something the user does, or the reverse.
- A module that relies on being imported for its side effects (the apps
  declare `sideEffects: ["*.css"]`, so such an import can be dropped).

**Server and client (ADR-0003, ADR-0009)**

- `"use client"` on more than the smallest component that needs the browser;
  large data passed as props into a client component.
- A server-only value reaching the browser: a secret or internal data in a
  client component's props or in a `NEXT_PUBLIC_*` variable. Code reading a
  non-public `process.env` value without `import "server-only"`.
- A page that should be static turned dynamic, or the reverse: compare the
  `next build` route table (○ ● ƒ) with what the page needs. Reading
  `searchParams`, cookies or headers makes a route dynamic.
- Server fetches without an explicit cache or revalidate decision.

**Input, external data and errors (ADR-0008, ADR-0010)**

- Route params or search params used without validation (the `parseRange`
  pattern: own keys only, a fallback for anything else).
- External responses used without handling their failure; an error swallowed
  without a log line on the server.
- A data-driven section without its empty and error states, or a failure that
  breaks the whole page instead of the section.

**Pages**

- A new route without `metadata` or `generateMetadata`; a dynamic route whose
  unknown params don't 404 (`dynamicParams = false` with `generateStaticParams`,
  or `notFound()`).
- A new route missing from its app's `tests/visual/pages.spec.ts` (ADR-0008),
  or from the main navigation when it should be there.

**Accessibility**

- Icon-only controls without an accessible name; images without meaningful
  `alt` (or `alt=""` for decoration); a `div` or `span` acting as a button or
  link; heading levels that skip; focus styles removed; colour as the only
  signal; state changes (copied, errors) not announced.

**Analytics (ADR-0010)**

- A tracked interaction made a client component instead of `trackClick`
  attributes; event properties that Amplitude already infers (page, referrer,
  device); anything personal in event properties; a new event missing from the
  app README's event table.

**Content (ADR-0011)**

- A replaced file in `public/` that kept its name (it must get a new
  date-stamped one); content that belongs in an entity's `model/` hard-coded in
  a view or component; text on the site that's no longer true (paths, counts,
  tools).

**Tests (ADR-0008)**

- A new critical path (untrusted input, an external API's response, auth,
  writes of user data) without a test; a test file whose first line doesn't
  name the risk; a test of presentational or formatting code, which the policy
  rules out.

**Performance**

- Client JavaScript added for something the server could render; heavy
  imports in a client component; `new Intl.*` created per render instead of at
  module level; `next/image` with `fill` but no `sizes`, `priority` below the
  fold, or a large image served unoptimised.

**Delivery and infrastructure (ADR-0002, ADR-0004, ADR-0005)** — full reviews

- A runtime secret passed as a build arg or written into a command; a new
  secret without its Parameter Store grant; a workflow change without the
  `paths` filters it needs; a Dockerfile copying what the image doesn't use.

**Docs (ADR-0001)**

- A decision made in code without an ADR, README note or comment; an ADR the
  code contradicts; README or `AGENTS.md` paths and commands out of date; a
  "Planned" line for something that has landed (update it in place);
  comments that restate the code.

## How to run a full review

1. `pnpm validate` (must pass). For route-level checks, `pnpm build` and read
   the route table.
2. Per app, read each slice's `index.ts` / `server.ts` first (its public API),
   then the files layer by layer from the bottom: `shared` → `entities` →
   `features` → `views` → `app`. Then `public/`, config, workflows and docs.
3. Keep notes per checklist area, including areas where nothing was found.

## Output

1. **Findings**, most severe first. Each one: severity, `file:line`, rule, what
   goes wrong, suggested fix.
2. **Checked, nothing found**: the checklist areas that came up clean, so the
   reader knows they were looked at.
3. **Needs a decision**: findings whose fix would change an ADR or what the
   site does; these go to the owner.

Then fix blockers and majors, or hand each one to the owner with a reason, and
run `pnpm validate` again. Agents don't commit (ADR-0006).

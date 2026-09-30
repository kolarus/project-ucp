# 0011. Content as code: typed data in the repository, no CMS

- Status: accepted
- Date: 2026-09-30 (recorded retroactively; in effect since 2026-09-18,
  date-stamped assets since 2026-09-25)
- Scope: bmorozov.com
- Related: ADR-0008 (visual snapshots), ADR-0009 (structure)

## Context

bmorozov.com's content changes a few times a month: a project entry, a new CV,
a contact detail. Only the owner edits it, and every change should be
reviewable, versioned and deployed like code. Cloudflare caches static files in
front of the site, so a replaced file can be served stale for a long time.

## Decision

- **Content is typed TypeScript data** in the entity it belongs to: projects in
  `entities/project/model`, contact channels in `entities/contact-channel`,
  headline stats and languages in `entities/profile`, the CV in `entities/cv`.
  The types make a missing field a build error.
- **Long-form write-ups are TSX** in `entities/project/content/`, one component
  per project, so they can use the site's own components and typed links.
- **No CMS.** A content change is a commit: it goes through `pnpm validate`, the
  visual snapshots (an intended change updates the baselines) and the normal
  deploy.
- **Static files that change get date-stamped names**
  (`CV_Bohdan_Morozov_2026-09.pdf`, `personal-website-2026-09.jpg`), so a new
  version has a new URL that no cache has seen. Stable short links redirect to
  the current file: `/cv` and the original `/cv/CV_Bohdan_Morozov.pdf` are
  temporary (307) redirects in `next.config.ts`, so publishing a new CV moves
  them at once.

## Alternatives considered

- **A headless CMS** (Sanity, Contentful). Editing without a deploy, but an
  account, an API, drafts and previews for one editor who already works in the
  repository.
- **Markdown or MDX files.** Good for long prose, but the write-ups mix prose
  with typed links and components, and the rest of the content is structured
  data that TypeScript checks better.
- **Overwriting files in place and purging Cloudflare's cache.** An extra step
  on every change, and browsers keep their own copy.

## Consequences

Positive:

- Content is reviewed, versioned and type-checked like code, and a broken link
  or missing field fails the build.
- A new CV or screenshot is never served stale.

Negative / accepted costs:

- Every content edit needs a commit and a deploy (a few minutes).
- Old date-stamped files must be deleted by hand when replaced.

## Enforcement

- TypeScript types for every kind of content; `typedRoutes` for internal links.
- Visual snapshots show every content change on the pages (ADR-0008).
- Convention: date-stamped names for replaceable files in `public/`, described
  in the app README.

## References

- `apps/web/bmorozovcom/README.md` (Content): how to publish a CV or a project
- `apps/web/bmorozovcom/src/entities/`, `apps/web/bmorozovcom/next.config.ts`

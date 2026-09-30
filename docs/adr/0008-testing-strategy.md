# 0008. Testing: critical paths only, visual snapshots, no end-to-end tests

- Status: accepted
- Date: 2026-09-30
- Scope: monorepo
- Related: ADR-0007 (validation), ADR-0005 (delivery)

## Context

Every test is code to maintain, and tests that pin implementation details have
to be rewritten by every refactor. Types, lint and the checks in ADR-0007
already catch a lot. What they can't see is whether untrusted input is handled,
whether an external API's response is read correctly, and whether a page still
looks right. Two past bugs were of the first two kinds: the stats page's range
parameter accepted inherited property names such as `toString` (fixed
2026-09-23), and Amplitude's grouped labels come in two shapes, only one of
which was handled at first. A refactor that moves every file of bmorozov.com is
planned, and it needs proof that nothing visible changed.

## Decision

**Unit tests only for critical paths.** A test is written only when both hold:

1. **A bug there would be serious:** it breaks a page, leaks data, loses or
   corrupts user data, lets bad input through, or silently shows wrong numbers.
2. **Nothing else would catch it:** not types, not lint, not the visual
   snapshots.

- **Qualifies:** untrusted input (URL parameters, forms), parsing of external
  API responses and, in jobs.bmorozov.com, auth and writes of user data.
- **Never:** presentational components (the snapshots cover them), formatting
  helpers, config data, framework or library behaviour, the repository's own
  check scripts.
- **No coverage targets.** Each test file's first line names the risk it
  guards. A test that can't name one is deleted.
- **Vitest**, Node environment, no DOM and no Testing Library. Tests sit next
  to their code as `<module>.test.ts`. External services are stubbed at `fetch`
  and the clock is faked where time matters.

**Visual snapshots instead of end-to-end tests** (`pnpm test:visual`):

- **Playwright only as a screenshot runner.** It takes full-page screenshots of
  every route of every app, at desktop (1280 px) and mobile (390 px) widths, in
  the light colour scheme, and compares them with the committed baselines in
  `apps/web/<app>/tests/visual/__screenshots__/`. A new route gets a line in
  its app's `tests/visual/pages.spec.ts`.
- **Against the production build** (`next build`, then `next start`), as Next's
  testing guide recommends.
- **Always in the same environment:** the official Playwright image, tagged with
  the exact `@playwright/test` version the apps pin, as `linux/amd64`, locally
  and in CI. Fonts render differently on macOS and Linux, and Chromium's
  rendering can differ between CPU architectures, so baselines taken anywhere
  else wouldn't match.
- **Deterministic pages:** no Amplitude keys, so there's no analytics and the
  stats page shows its "not connected" state; no deploy SHA in the footer;
  reduced motion; images loaded before the shot; the footer's copyright year
  masked.
- **Strict comparison:** no differing pixels, and a per-pixel colour threshold
  of 0, so any colour change counts. Only pixels that Playwright's anti-aliasing
  detection flags are ignored. Playwright's default threshold (0.2) is too lax:
  with it, headings recoloured from `#171717` to `#333333` passed on every page.
  If a page ever proves flaky, the fix is a small absolute budget
  (`maxDiffPixels`), never a percentage: that recoloured heading was 3,974
  pixels, 0.35% of the page.
- **An intended visual change** means running `pnpm test:visual:update`,
  reviewing the new PNGs, and committing them with the change. A failed run
  leaves the expected, actual and diff images in the app's `test-results/`.

**No end-to-end user-flow tests.** The sites' interactions are links and a copy
button. Revisit for jobs.bmorozov.com only if a flow meets both conditions
above, such as saving an application.

## Alternatives considered

- **Broad unit tests with a coverage target.** High maintenance, and tests of
  implementation details break on every refactor without catching bugs.
- **End-to-end tests of user flows.** Slow and prone to flakiness, for sites
  that have almost no flows.
- **Component tests (Testing Library, jsdom).** They assert DOM structure that
  the screenshots already cover, and the structure changes with every refactor.
- **A hosted visual-testing service** (Chromatic, Percy, Argos). Better review
  tools, but an account, a cost and uploads to a third party for two small
  sites.
- **Screenshots on the host machine.** Baselines would only match the machine
  that took them.
- **The native arm64 image on Apple Silicon.** Faster locally, but it could
  disagree with the amd64 CI runners.
- **Playwright's default colour threshold, or a percentage tolerance.** Both
  hide real changes; see above.

## Consequences

Positive:

- A refactor that moves every file can be shown to change nothing visible.
- The few unit tests each guard a stated risk, so none are kept out of habit.

Negative / accepted costs:

- A visual run takes minutes: two production builds and a browser, under
  amd64 emulation on Apple Silicon. It's too slow for the pre-push hook, so CI
  runs it (planned: ADR-0005 amendment).
- Running it locally needs Docker.
- Baselines add PNGs to the repository with every intended visual change.
- Screenshots can't see behaviour: a copy button that stopped copying, or a
  missing analytics event, still passes. Accepted for these sites.
- The dark colour scheme isn't covered.

## Enforcement

- `pnpm validate` runs the unit tests (ADR-0007).
- `pnpm test:visual`; planned: CI runs it before every deploy.
- `AGENTS.md` states the testing rule for agents.

## References

- `apps/web/bmorozovcom/src/lib/amplitude-api.test.ts`
- `apps/web/<app>/playwright.config.ts`, `apps/web/<app>/tests/visual/`
- `scripts/test-visual.mts`
- `node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md`
- https://playwright.dev/docs/test-snapshots

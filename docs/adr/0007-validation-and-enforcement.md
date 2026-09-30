# 0007. Validation: one `pnpm validate`, shared config, git hooks

- Status: accepted
- Date: 2026-09-30
- Scope: monorepo
- Related: ADR-0003 (web stack), ADR-0005 (delivery), ADR-0006 (workflow),
  ADR-0008 (testing)

## Context

Until 2026-09-30 nothing checked a change before it deployed except the type
check inside `next build`. Next.js 16 stopped linting during builds, so lint ran
only when someone remembered. There was no format check, no tests, and no check
that the docs and ADRs stayed consistent. Both apps carried their own copies of
the TypeScript and ESLint configs. A push to `main` deploys (ADR-0005), so
whatever isn't checked before the push reaches production.

## Decision

**One command, `pnpm validate`, answers "is this safe to push?"** It's the same
command locally, in the pre-push hook and in CI. It runs the cheap checks
first:

| Step | Tool | Checks |
|---|---|---|
| `format:check` | Prettier | formatting of code and config |
| `check-docs` | `scripts/check-docs.mts` | ADR numbering, headers, sections and index rows (ADR-0001); every relative link in the Markdown resolves |
| `typecheck` | `next typegen` + `tsc` per app; `tsc` for the root scripts | types, typed routes |
| `test` | Vitest | the few critical-path unit tests (ADR-0008) |
| `lint` | ESLint with `@project-ucp/eslint-config` | Next's rules plus type-aware ones; **warnings fail** (`--max-warnings 0`) |
| `knip` | knip | unused files, exports and dependencies |

Visual snapshots take minutes rather than seconds, so they run as their own
command, `pnpm test:visual` (ADR-0008).

**Config lives in workspace packages**, so every app, current or future,
extends one source:

- `@project-ucp/tsconfig` (`packages/tsconfig`): `base.json` and `nextjs.json`
  (ADR-0003 amendment).
- `@project-ucp/eslint-config` (`packages/eslint-config`): `eslint-config-next`
  (core web vitals and TypeScript) plus five type-aware rules that catch bugs
  rather than style: `no-floating-promises`, `no-misused-promises` and
  `await-thenable` (a promise nobody handles fails silently),
  `switch-exhaustiveness-check` (a new member of a union must be handled
  wherever it's switched on) and `consistent-type-imports` (type-only imports
  are erased, so they can't pull server code into a client bundle).
- **Prettier with its defaults**, configured only by the root `.prettierignore`.
  Markdown is excluded: it's hand-wrapped, Prettier would re-pad every table on
  each edit, and each app's `AGENTS.md` holds a block that `next dev` rewrites
  byte for byte. `check-docs` covers the docs instead.

**Git hooks through lefthook**, installed by `pnpm install` (the root `prepare`
script):

- `commit-msg` runs commitlint with `@commitlint/config-conventional`, which
  enforces ADR-0006's Conventional Commits.
- `pre-push` runs `pnpm validate`.

**Repository scripts are TypeScript run directly by Node 24**, which strips the
types. They're type-checked by the root `tsconfig.json`, and use only erasable
syntax (no enums or namespaces). There's no build step and no `tsx`.

## Alternatives considered

- **Lint in the editor and on demand only.** That's how lint quietly stopped
  running when Next.js 16 dropped it from `next build`.
- **Biome instead of ESLint and Prettier.** One fast tool, but no equivalent of
  `eslint-config-next` (React hooks, Core Web Vitals, Next.js rules) and no
  type-aware rules.
- **The full `recommended-type-checked` or `strict` presets.** Dozens of rules,
  many of them stylistic. The five chosen ones catch real bugs; more can be
  added when a bug shows the need.
- **Checking only staged files (lint-staged).** Faster hooks, but a
  whole-repository run takes about 10 seconds and catches breakage across files,
  such as removing an export another file still uses.
- **Validating on every commit instead of every push.** Every commit would wait;
  a push is what deploys.
- **Husky instead of lefthook.** Either works; lefthook is one binary with one
  YAML file and no generated scripts directory.
- **Running scripts through `tsx` or a build step.** An extra dependency or
  step that Node 24 no longer needs.

## Consequences

Positive:

- One command, about 10 seconds, says whether a change is safe to push.
- Lint, formatting, tests and docs checks can no longer silently stop running.
- A rule or compiler option changes in one package for every app.

Negative / accepted costs:

- Every push waits for `pnpm validate`.
- Hooks only run where `pnpm install` ran, and `--no-verify` skips them. CI
  runs the same checks on every push and before every deploy (ADR-0005), so a
  skipped hook can't ship a failing change.
- `eslint-config-next` is pinned in the shared package and must move together
  with `next` in the apps.
- The checks need Node 24: the type-stripped scripts don't run on older Node.

## Enforcement

- `lefthook.yml`: `commit-msg` and `pre-push` hooks.
- Root `package.json` scripts: `validate` and its steps.
- CI: the same `pnpm validate` on every push and before every deploy
  (`checks.yml`, ADR-0005).

## References

- `package.json`, `lefthook.yml`, `commitlint.config.mjs`, `.prettierignore`
- `packages/tsconfig/`, `packages/eslint-config/`
- `scripts/check-docs.mts`
- https://typescript-eslint.io/getting-started/typed-linting
- https://nodejs.org/api/typescript.html

## Amendment 2026-09-30: architecture checks

`pnpm validate` gains `check-architecture` (after `check-docs`), and the shared
ESLint config gains the layer rules, `import/no-cycle` and two restrictions
(the analytics SDK, `fetch`). What they enforce is ADR-0009.

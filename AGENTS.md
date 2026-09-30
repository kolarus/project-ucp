# AGENTS.md

A pnpm monorepo of personal projects: Next.js apps (bmorozov.com,
jobs.bmorozov.com) self-hosted on AWS. `CLAUDE.md` imports this file. Each app
has its own `AGENTS.md` too; read both when working in an app.

## Read before changing anything

1. [docs/adr/README.md](docs/adr/README.md): the Architecture Decision Records
   are **binding**.
2. The ADR for the area you touch (table below).
3. The app's `AGENTS.md` (`apps/web/<app>/AGENTS.md`). Its Next.js block
   matters: **Next.js 16 differs from older versions**, so read the docs bundled
   in `node_modules/next/dist/docs/` before relying on memory.

| Area | ADR |
|---|---|
| Recording decisions | [0001](docs/adr/0001-record-architecture-decisions.md) |
| Workspace, dependencies, Dockerfiles | [0002](docs/adr/0002-pnpm-workspace.md) |
| Next.js, TypeScript, styling, rendering, Node version | [0003](docs/adr/0003-web-stack.md) |
| Server, Caddy, Cloudflare, Terraform | [0004](docs/adr/0004-hosting-and-infrastructure.md) |
| Deploy workflows, CI checks, secrets | [0005](docs/adr/0005-delivery-and-secrets.md) |
| Commits and agent rules | [0006](docs/adr/0006-contribution-workflow.md) |
| Checks, lint and TypeScript config, git hooks | [0007](docs/adr/0007-validation-and-enforcement.md) |
| Tests and visual snapshots | [0008](docs/adr/0008-testing-strategy.md) |
| Where code goes: layers, slices, imports | [0009](docs/adr/0009-layered-structure.md) |
| bmorozov.com analytics and stats page | [0010](docs/adr/0010-analytics.md) |
| bmorozov.com content, CV, date-stamped files | [0011](docs/adr/0011-content-as-code.md) |

## Repository map

```
apps/web/<app>/      Next.js apps, one workspace package each, own Dockerfile
  src/               app → views → features → entities → shared (below)
apps/infra/          Terraform (main.tf), cloud-init, Caddyfile
packages/            shared config: tsconfig, eslint-config (code later, when two apps need it)
docs/adr/            decision records
scripts/             repo tooling: `pnpm dev` app picker, check-docs, check-architecture, test-visual
.github/workflows/   validate.yml and deploy-<app>.yml → deploy-app.yml both run checks.yml; deploy-caddy.yml
.claude/skills/      agent skills (adr-new, where-does-it-go, web-review)
```

## Where code goes

Each app's `src/` has five layers; a layer imports only the layers below it
([0009](docs/adr/0009-layered-structure.md)).

```
app → views → features → entities → shared
```

1. Would another app use it unchanged? → `shared/<segment>` (`ui`, `lib`,
   `config`, `api`, `analytics`)
2. Is it a business *thing* (data, mapping, how it looks)? → `entities/<noun>`
3. Is it something the user *does*? → `features/<verb-noun>`
4. Does it put together one page? → `views/<page>`
5. Is it a route or global wiring? → `app/`: Next's route files only; a page
   reads params and renders one view.

- Import another slice only through its `index.ts`, or `server.ts` for
  server-only code; inside a slice, relative imports. Never sideways within a
  layer: the layer above composes, or a slot prop takes the other slice.
- Code sits in segments: `ui/`, `model/`, `api/`, `lib/`, and `content/` for
  write-ups. `"use client"` only in `ui/` files. kebab-case names.
- Unsure? Use the `where-does-it-go` skill. Lint and `check-architecture`
  reject what doesn't fit.

## Hard rules

- **Server-first.** Pages are server components. `"use client"` only where the
  browser is required. ([0003](docs/adr/0003-web-stack.md))
- **Secrets stay on the server.** Code that reads a secret imports
  `server-only`. `NEXT_PUBLIC_*` only for values that are public by design.
  Runtime secrets reach the container through Parameter Store, never as build
  args. ([0003](docs/adr/0003-web-stack.md), [0005](docs/adr/0005-delivery-and-secrets.md))
- **Nothing sensitive in committed files.** No account IDs, IP addresses,
  secret values or costs in code, docs or ADRs; the repository is public.
  ([0001](docs/adr/0001-record-architecture-decisions.md))
- **Infrastructure:** never run `terraform apply`. `terraform plan` is
  read-only; run it and report the result. A plan that replaces or destroys the
  instance is a stop sign. ([0004](docs/adr/0004-hosting-and-infrastructure.md))
- **Tests: bare-essential critical paths only.** Write a test only when a bug
  there would be serious (a broken page, leaked or lost data, bad input let
  through, wrong numbers shown) **and** nothing else would catch it: not types,
  not lint, not visual snapshots. Each test file names the risk it guards in its
  first line. No coverage targets. No end-to-end tests.
  ([0008](docs/adr/0008-testing-strategy.md))
- **Visual changes need new baselines.** If a change alters what a page looks
  like on purpose, run `pnpm test:visual:update`, look at the new PNGs, and say
  so in the handover. A new route gets a line in its app's
  `tests/visual/pages.spec.ts`. ([0008](docs/adr/0008-testing-strategy.md))

## Workflow

- **Agents never commit, push, tag or apply infrastructure, and add no AI
  attribution.** Prepare the change, run the checks, list the changed files and
  suggest a Conventional Commit message (`feat(bmorozovcom): …`); the owner
  commits. ([0006](docs/adr/0006-contribution-workflow.md))
- **Checks before handing over:** `pnpm validate` at the root (format, docs,
  structure, types, unit tests, lint, unused code; about 10 seconds), plus
  `pnpm test:visual` when anything visible could have changed. Report failures
  with their output. Needs Node 24: `nvm use` reads `.nvmrc`. At the end of a
  phase or before a release, also run the `web-review` skill, which covers what
  the checks can't see.
  ([0007](docs/adr/0007-validation-and-enforcement.md))
- **Pushing to `main` deploys** every app whose files changed, once CI's checks
  (`pnpm validate` and that app's visual snapshots) pass. Every push to any
  branch runs the checks too. A change to the root `package.json`, lockfile or
  workspace config redeploys every app.
  ([0002](docs/adr/0002-pnpm-workspace.md), [0005](docs/adr/0005-delivery-and-secrets.md))
- **Decisions:** hard to reverse, cross-cutting, or with a credible alternative
  → ADR (use the `adr-new` skill); local and cheap to change → the app's README;
  why code looks the way it does → a comment. If a change would contradict an
  ADR, write the superseding ADR first.
  ([0001](docs/adr/0001-record-architecture-decisions.md))
- **Comments explain why**, not what; no commented-out code.

## Commands

```bash
pnpm install                                   # at the root: every app, one lockfile; installs git hooks
pnpm dev [app]                                 # pick an app to run (bmorozovcom :3000, jobsbmorozovcom :3001)
pnpm validate                                  # every check; the pre-push hook runs it too
pnpm format                                    # fix formatting
pnpm test:visual [app]                         # screenshots vs baselines, in Docker (a few minutes)
pnpm test:visual:update [app]                  # after an intended visual change; review the PNGs
pnpm build                                     # every app
pnpm --filter <app> <script>                   # one app's script
docker build -f apps/web/<app>/Dockerfile .    # an app's image, from the root
cd apps/infra && terraform plan                # read-only; the owner applies
```

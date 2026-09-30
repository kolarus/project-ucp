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
| Deploy workflows, secrets | [0005](docs/adr/0005-delivery-and-secrets.md) |
| Commits and agent rules | [0006](docs/adr/0006-contribution-workflow.md) |

## Repository map

```
apps/web/<app>/      Next.js apps, one workspace package each, own Dockerfile
apps/infra/          Terraform (main.tf), cloud-init, Caddyfile
packages/            code and config shared between apps (none yet)
docs/adr/            decision records
scripts/             repo tooling (the `pnpm dev` app picker)
.github/workflows/   deploy-<app>.yml → deploy-app.yml; deploy-caddy.yml
.claude/skills/      agent skills (adr-new)
```

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
  first line. No coverage targets. (The owner's policy; its ADR is coming.)

## Workflow

- **Agents never commit, push, tag or apply infrastructure, and add no AI
  attribution.** Prepare the change, run the checks, list the changed files and
  suggest a Conventional Commit message (`feat(bmorozovcom): …`); the owner
  commits. ([0006](docs/adr/0006-contribution-workflow.md))
- **Checks before handing over:** `pnpm build` and `pnpm lint` at the root.
  `next build` type-checks but no longer lints, so run lint yourself.
- **Pushing to `main` deploys** every app whose files changed. A change to the
  root `package.json`, lockfile or workspace config redeploys every app.
  ([0002](docs/adr/0002-pnpm-workspace.md), [0005](docs/adr/0005-delivery-and-secrets.md))
- **Decisions:** hard to reverse, cross-cutting, or with a credible alternative
  → ADR (use the `adr-new` skill); local and cheap to change → the app's README;
  why code looks the way it does → a comment. If a change would contradict an
  ADR, write the superseding ADR first.
  ([0001](docs/adr/0001-record-architecture-decisions.md))
- **Comments explain why**, not what; no commented-out code.

## Commands

```bash
pnpm install                                   # at the root: every app, one lockfile
pnpm dev [app]                                 # pick an app to run (bmorozovcom :3000, jobsbmorozovcom :3001)
pnpm build | pnpm lint                         # across every app
pnpm --filter <app> <script>                   # one app's script
docker build -f apps/web/<app>/Dockerfile .    # an app's image, from the root
cd apps/infra && terraform plan                # read-only; the owner applies
```

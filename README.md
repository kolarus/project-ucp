# project-ucp

This is the space for my personal pet projects — a catalogue and a technical
playground, built with production-grade practices rather than for commercial
users.

## Layout

```
apps/
  web/bmorozovcom/       bmorozov.com — Next.js, containerised, deployed on push
  web/jobsbmorozovcom/   jobs.bmorozov.com — Next.js job tracker, deployed on push
  infra/                 Terraform and the Caddyfile for the AWS side of it
  api/                   (empty for now)
packages/                shared config (tsconfig, eslint-config); shared code later
docs/adr/                architecture decision records, one log for every project
scripts/                 repo tooling: `pnpm dev` app picker, docs check, visual snapshots
.github/workflows/       checks on every push; per-app deploy on push: checks → build → ECR → SSM
.claude/skills/          agent skills; AGENTS.md is the agents' entry point
```

Each app owns its `Dockerfile`; images are built from the repo root as context.
See an app's own README for how to run it.

## Decisions

Significant decisions are recorded as Architecture Decision Records in
[docs/adr/](docs/adr/README.md): why each choice was made, what else was
considered, and how it's checked. They're binding for every change, human or
agent. Start with the [index](docs/adr/README.md).

## Architecture

- **Apps:** Next.js App Router, rendered on the server by default
  ([ADR-0003](docs/adr/0003-web-stack.md)). Every app's `src/` has the same five
  layers, `app → views → features → entities → shared`. A layer imports only
  the layers below it, and other slices only through their `index.ts`; lint and
  `check-architecture` enforce it
  ([ADR-0009](docs/adr/0009-layered-structure.md)).
- **Packages:** config every app extends (TypeScript, ESLint). Code moves here
  only once a second app needs it unchanged.
- **Delivery:** every push runs the checks and the screenshot comparison. A
  push to `main` deploys each changed app to one EC2 host behind Caddy and
  Cloudflare, only after its checks pass
  ([ADR-0004](docs/adr/0004-hosting-and-infrastructure.md),
  [ADR-0005](docs/adr/0005-delivery-and-secrets.md)).

## Workspace

One pnpm workspace: `pnpm install` at the root installs every app from a single
lockfile, and `pnpm build` / `pnpm lint` there run across all of them. Run one
app's scripts from its directory, or from the root with
`pnpm --filter <app> <script>`.

`pnpm dev` at the root asks which app to start (or all of them). Name it to skip
the question — a unique prefix is enough, e.g. `pnpm dev jobs`.

Node 24 is required (`nvm use` reads `.nvmrc`); installing on another version
fails.

## Checks

- `pnpm validate` runs every fast check: formatting, the ADRs and doc links,
  the folder structure, types, unit tests, lint and unused code
  ([ADR-0007](docs/adr/0007-validation-and-enforcement.md)). The pre-push hook
  runs it, and commit messages are checked against Conventional Commits.
- `pnpm test:visual` screenshots every page and compares it with the committed
  baselines, inside the Playwright Docker image; it needs Docker. After an
  intended visual change, `pnpm test:visual:update` regenerates the baselines
  to review and commit ([ADR-0008](docs/adr/0008-testing-strategy.md)).
- CI runs both on every push to any branch, and every deploy waits for them:
  a red check never deploys ([ADR-0005](docs/adr/0005-delivery-and-secrets.md)).
  A failed visual run attaches its diff images to the run as `visual-diffs`.

## Adding a project

Create a directory under `apps/web/` with its own `package.json` and a README
describing what it does and how to run it, then run `pnpm install` at the root —
the workspace picks it up. Its `tsconfig.json` and `eslint.config.mjs` extend
the shared packages, and it gets a `playwright.config.ts` and
`tests/visual/pages.spec.ts` like the existing apps. Code shared between apps
goes in `packages/`.

To deploy it, add a `.github/workflows/deploy-<app>.yml` like
`deploy-bmorozovcom.yml`. Its `paths` filter means a push only deploys the apps
it touched, plus every app when the root workspace files, `packages/` or the
shared workflows change. The checks, build and deploy steps are shared in
`deploy-app.yml`. The app first needs an ECR repository (`personal/<app>`) and a
site in `apps/infra/Caddyfile`, which `deploy-caddy.yml` pushes to the server.

## Contributions

This repository is published for reading — it's a record of how my projects are
built, not an open collaboration. I'm not accepting pull requests, and issues
are disabled; any PR opened here will be closed unmerged.

Spotted something genuinely broken? Contact details are on
[bmorozov.com](https://bmorozov.com/contact).

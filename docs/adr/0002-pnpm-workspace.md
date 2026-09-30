# 0002. One pnpm workspace; images built from the repository root

- Status: accepted
- Date: 2026-09-30 (recorded retroactively; in effect since 2026-09-25)
- Scope: monorepo
- Related: ADR-0003 (web stack), ADR-0005 (delivery)

## Context

The repository hosts several projects that share a stack, tooling and one
deployment target. Until 2026-09-25 each app carried its own lockfile and was
installed on its own. With a second app (jobs.bmorozov.com) arriving, that meant
duplicated installs, versions drifting apart, and no clean place for code
shared between apps.

## Decision

Run the repository as **one pnpm workspace**.

- **Layout:**
  - `apps/web/<app>`: each Next.js app is a workspace package.
  - `packages/<name>`: code and config shared between apps.
  - `apps/infra`: Terraform and the Caddyfile. Not a workspace package.
- **One lockfile at the root.** `pnpm install` at the root installs every app.
  pnpm is pinned through `packageManager` in the root `package.json` and
  activated with corepack.
- **Root scripts run across the workspace:** `pnpm build` and `pnpm lint` in
  every app, and `pnpm dev` asks which app to start. One app's scripts run from
  its directory or with `pnpm --filter <app> <script>`.
- **Dependency build scripts stay off** unless listed. pnpm 10 skips them by
  default, and `sharp` and `unrs-resolver` are listed in
  `ignoredBuiltDependencies` because they ship prebuilt binaries.
- **Every app owns its Dockerfile** (`apps/web/<app>/Dockerfile`) but is
  **built with the repository root as context**, because that's where the
  lockfile and workspace config live:
  - dependencies install with `pnpm install --frozen-lockfile --filter <app>...`
    (the app and its workspace dependencies only);
  - `next build` produces standalone output traced from the repository root
    (`outputFileTracingRoot`), so the image mirrors the repository layout under
    `/app`;
  - the root `.dockerignore` keeps `node_modules`, build output, infrastructure
    state and private notes out of every build context.

## Alternatives considered

- **One repository per project.** Duplicates tooling, CI and infrastructure for
  apps that share all three, and hides how they fit together.
- **A lockfile per app**, which was the setup until 2026-09-25. Versions drift
  apart and shared packages have no clean home.
- **npm or Yarn workspaces.** Both would work. pnpm's strict `node_modules`
  stops an app from using a dependency it didn't declare, and its store keeps
  installs fast.
- **Turborepo or Nx.** Task caching and project graphs pay off with many
  packages. With two apps, `pnpm -r` is enough. Revisit when builds get slow.

## Consequences

Positive:

- One install, one set of versions, one place to upgrade.
- Shared config and code can move into `packages/` without publishing anything.
- Each image contains only its own app and its dependencies.

Negative / accepted costs:

- The root `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` and
  `packages/` are inputs to every image, so a change to any of them rebuilds and
  redeploys every app (ADR-0005). Harmless but noticeable: on 2026-09-25 a new
  root `dev` script redeployed bmorozov.com.
- A single lockfile means an upgrade for one app can touch another app's
  dependency tree.

## Enforcement

- `--frozen-lockfile` in every image build fails if the lockfile is out of date.
- Convention: new apps go under `apps/web/<app>` with their own Dockerfile,
  following the existing ones.

## References

- `pnpm-workspace.yaml`, root `package.json`
- `apps/web/*/Dockerfile`, `apps/web/*/next.config.ts`
- https://pnpm.io/workspaces

## Amendment 2026-09-30: shared config packages

- **The first workspace packages hold config:** `packages/tsconfig`
  (`@project-ucp/tsconfig`) and `packages/eslint-config`
  (`@project-ucp/eslint-config`). Apps depend on them as `workspace:*` and
  extend them; the per-app copies are gone (ADR-0007). Shared *code* waits until
  a second app needs it unchanged.
- **Images copy `packages/`** into their install stage: `--filter <app>...`
  installs the app's workspace dependencies too, and `next build` reads the
  shared TypeScript config.
- **Repository tooling is installed at the root** (Prettier, knip, lefthook,
  commitlint, TypeScript for the scripts). The images' install stage gets it
  too, since pnpm links the root's dependencies even with `--filter`, but the
  final image holds only the traced standalone output. The images install with
  `--ignore-scripts`, because the root `prepare` script needs git.
- **`lefthook` joins `ignoredBuiltDependencies`.** Its install script would set
  up the git hooks; the root `prepare` script does that explicitly instead.

# project-ucp

This is the space for my personal pet projects — a catalogue and a technical
playground, built with production-grade practices rather than for commercial
users.

## Layout

```
apps/
  web/bmorozovcom/       bmorozov.com — Next.js, containerised, deployed on push
  web/jobsbmorozovcom/   jobs.bmorozov.com — Next.js job tracker, not deployed yet
  infra/                 Terraform and the Caddyfile for the AWS side of it
  api/                   (empty for now)
packages/                code shared between apps (none yet)
.github/workflows/       per-app deploy on push: build → push to ECR → deploy over SSM
```

Each app owns its `Dockerfile`; images are built from the repo root as context.
See an app's own README for how to run it.

## Workspace

One pnpm workspace: `pnpm install` at the root installs every app from a single
lockfile, and `pnpm build` / `pnpm lint` there run across all of them. Run one
app's scripts from its directory, or from the root with
`pnpm --filter <app> <script>`.

## Adding a project

Create a directory under `apps/web/` with its own `package.json` and a README
describing what it does and how to run it, then run `pnpm install` at the root —
the workspace picks it up. Code shared between apps goes in `packages/`.

To deploy it, add a `.github/workflows/deploy-<app>.yml` like
`deploy-bmorozovcom.yml`: its `paths` filter means a push only deploys the apps
it touched (plus the root workspace files and `packages/`, which every image is
built from), and the build and deploy steps are shared in `deploy-app.yml`. The
app first needs an ECR repository (`personal/<app>`) and a site in
`apps/infra/Caddyfile`, which `deploy-caddy.yml` pushes to the server.

## Contributions

This repository is published for reading — it's a record of how my projects are
built, not an open collaboration. I'm not accepting pull requests, and issues
are disabled; any PR opened here will be closed unmerged.

Spotted something genuinely broken? Contact details are on
[bmorozov.com](https://bmorozov.com/contact).

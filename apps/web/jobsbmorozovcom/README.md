# jobsbmorozovcom

jobs.bmorozov.com — a job application tracker. Anyone can sign up, track their
applications on a simple board and get analytics on their hiring funnel; my own
stats are public, so my hiring progress can be followed directly.

Next.js App Router app, a package in the repo's pnpm workspace with its own
`Dockerfile`. Frontend only for now — the home page is a placeholder.

## Develop

Dependencies install from the repo root (`pnpm install` there). Then, from this
directory:

```bash
pnpm dev     # http://localhost:3001
pnpm build
pnpm lint
```

Runs on port 3001 so it doesn't collide with bmorozovcom on 3000.

## Deploy

Not deployed yet. The image builds like bmorozovcom's — the context is the repo
root, so run it from there:

```bash
docker build -f apps/web/jobsbmorozovcom/Dockerfile -t jobsbmorozovcom .
docker run -p 3001:3000 jobsbmorozovcom
```

Same multi-stage `node:22-alpine` build as bmorozovcom: dependencies,
`next build`, then a runtime stage with only `.next/standalone`
(`output: "standalone"`), `.next/static` and `public/`. Runs as a non-root user
on port 3000 inside the container.

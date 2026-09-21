# project-ucp

This is the space for my personal pet projects — a catalogue and a technical
playground, built with production-grade practices rather than for commercial
users.

## Layout

```
apps/
  web/bmorozovcom/   bmorozov.com — Next.js, containerised, deployed on push
  infra/             Terraform for the AWS side of it
  api/               (empty for now)
.github/workflows/   build → push to ECR → deploy over SSM
```

Each app owns its `Dockerfile`; images are built from the repo root as context.
See an app's own README for how to run it.

## Adding a project

Create a directory under `apps/` and give it its own README describing what it
does and how to run it.

## Contributions

This repository is published for reading — it's a record of how my projects are
built, not an open collaboration. I'm not accepting pull requests, and issues
are disabled; any PR opened here will be closed unmerged.

Spotted something genuinely broken? Contact details are on
[bmorozov.com](https://bmorozov.com/contact).

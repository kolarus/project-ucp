<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## This app: jobs.bmorozov.com

- Job application tracker at https://jobs.bmorozov.com. For now only a
  placeholder home page. Runs on port 3001, locally and on the server.
- Repo-wide rules come first: [root AGENTS.md](../../../AGENTS.md) and the
  [ADRs](../../../docs/adr/README.md). Decisions specific to this app are ADRs
  with `Scope: jobs.bmorozov.com`.
- How it works: [README.md](README.md).

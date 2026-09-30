# Architecture Decision Records

Binding decisions for every project in this repository, one log for all of them;
`Scope` says which project a decision applies to. Process:
[ADR-0001](0001-record-architecture-decisions.md). New ADR: copy
[template.md](template.md) (or use the `adr-new` skill), take the next number,
add a row here.

Start with **[0001 — the process](0001-record-architecture-decisions.md)** and
**[0005 — how code reaches production](0005-delivery-and-secrets.md)**.

| # | Decision | Scope | Status |
|---|---|---|---|
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | monorepo | accepted |
| [0002](0002-pnpm-workspace.md) | One pnpm workspace; images built from the repository root | monorepo | accepted |
| [0003](0003-web-stack.md) | Web stack: Next.js App Router, strict TypeScript, Tailwind, server-first | monorepo | accepted |
| [0004](0004-hosting-and-infrastructure.md) | Hosting: one EC2 host, Caddy, Cloudflare; infrastructure as Terraform | monorepo | accepted |
| [0005](0005-delivery-and-secrets.md) | Delivery and secrets: per-app workflows, OIDC, ECR, SSM, Parameter Store | monorepo | accepted |
| [0006](0006-contribution-workflow.md) | Contribution workflow: solo, straight to `main`, read-only in public | monorepo | accepted |

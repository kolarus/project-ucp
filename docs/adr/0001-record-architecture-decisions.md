# 0001. Record architecture decisions

- Status: accepted
- Date: 2026-09-30
- Scope: monorepo
- Related: ADR-0006 (workflow)

## Context

This repository holds several personal projects: bmorozov.com,
jobs.bmorozov.com, and more to come. It's public, and part of its purpose is to
show how the projects are built, not just what they do. Coding agents work in it
alongside the owner.

By 2026-09-30, real and hard-to-reverse decisions had been made (hosting,
delivery, secrets, analytics), but they lived only in READMEs, code comments,
a project write-up and chat history. Decisions kept like that get lost, get
quietly reversed, or get argued over again. Agents can't find them.

We need a lightweight record that explains *why*, lives next to the code, is
versioned with it, and that humans and agents reach from one entry point
(`AGENTS.md`).

## Decision

Use **Architecture Decision Records** in `docs/adr/`: **one log for the whole
repository**, in a lightweight format based on MADR ([template](template.md)).

- **File name:** `NNNN-kebab-case-title.md`, numbered in order, no gaps, never
  reused.
- **Header:** Status, Date, **Scope** (`monorepo` or the project's domain, such
  as `bmorozov.com`) and Related.
- **Sections:** Context, Decision, Alternatives considered, Consequences,
  **Enforcement**, References. About one screen each.
- **Status:** `proposed` → `accepted` → optionally `deprecated` or
  `superseded by NNNN`.
- **Index:** [`README.md`](README.md) lists number, title, scope and status.

**Changing a decision:**

- **Reversing or contradicting** an accepted ADR needs a new ADR that
  supersedes it; only the old ADR's status line changes.
- **Extending** one without contradicting it adds a dated section at its end
  (`## Amendment YYYY-MM-DD: …`). One topic stays in one document.
- Typo and link fixes are always fine.

**Recording decisions made earlier:** an ADR written after the fact says so in
its Date line (`recorded retroactively; in effect since YYYY-MM-DD`).

**ADRs are public.** Never write down account IDs, IP addresses, secret values,
costs, or anything personal. Private planning lives outside the repository.

**Where a decision goes:**

| Kind of decision | Home |
|---|---|
| Hard to reverse, cross-cutting, or had a credible alternative someone might ask about | **ADR** |
| Worth knowing but local and cheap to change (a cache duration, a page size) | the app's **README**, plus a comment at the constant |
| Why a specific piece of code looks the way it does | **code comment**, linking the ADR if there is one |

If a change would contradict an ADR, stop and write the superseding ADR first,
then change the code.

## Alternatives considered

- **One log per app** (`apps/web/<app>/docs/adr/`). Most decisions so far span
  every app (workspace, hosting, delivery, tooling, structure). Per-app logs
  would split them and need cross-links. `Scope` marks the app-specific ones
  instead. Revisit if an app moves to its own repository.
- **Private ADRs.** Loses the point of a public repository that shows how things
  are built. Sensitive detail stays out by rule instead.
- **READMEs only.** Fine for summaries, but they grow long and lose history.
  READMEs link to ADRs instead.
- **A wiki or Notion.** Lives apart from the code, isn't versioned with it, and
  agents can't read it in the repository.
- **Strictly immutable ADRs**, where every extension is a new ADR. Splits one
  topic across several documents. Amendment sections keep it together, and
  reversals still get a new ADR.

## Consequences

Positive:

- The reasoning behind each choice, and the alternatives rejected, is on record
  next to the code.
- Agents and the owner work from one binding rulebook.
- Reversing a decision is visible and deliberate.

Negative / accepted costs:

- Writing time. ADRs are kept to about a screen.
- ADRs can drift from the code. The review skill and the docs check (below)
  guard against it.

## Enforcement

- `AGENTS.md` makes the ADR index required reading and tells agents to check a
  change against the relevant ADR.
- The `adr-new` skill (`.claude/skills/adr-new`) scaffolds the next ADR and its
  index row, and first checks whether the decision needs an ADR at all.
- Planned: an automated docs check in the validation pipeline (numbering,
  statuses, index entries, links).

## References

- Michael Nygard, "Documenting Architecture Decisions" (2011)
- MADR: https://adr.github.io/madr/

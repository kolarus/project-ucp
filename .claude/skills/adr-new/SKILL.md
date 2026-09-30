---
name: adr-new
description: Scaffold a new Architecture Decision Record in docs/adr/, or extend an existing one with an amendment. Use when a decision is hard to reverse, cross-cutting, or had a credible alternative; when a change would contradict an existing ADR (write a superseding one); or when the user asks to record a decision.
---

# adr-new

Creates or extends an ADR in `docs/adr/`, following
[ADR-0001](../../../docs/adr/0001-record-architecture-decisions.md). ADRs are
binding and public. There is **one log for the whole repository**; the `Scope`
line says which project a decision applies to.

## First: does this need an ADR at all?

| Decision | Home |
|---|---|
| Hard to reverse, cross-cutting, or had a credible alternative someone would ask about | **ADR** |
| Worth knowing, but local and cheap to change (a cache duration, a page size) | the app's README, plus a comment at the constant |
| Why a specific piece of code looks the way it does | a code comment (link the ADR if one exists) |

## Second: new ADR, amendment, or superseding?

Read `docs/adr/README.md` and any ADR on the same topic first.

- **Extends an existing ADR without contradicting it** → add a section at the end
  of that ADR: `## Amendment YYYY-MM-DD: <what changed>`. One topic stays in one
  document; the owner prefers this to a new ADR.
- **Reverses or contradicts an accepted ADR** → a new ADR that supersedes it.
- **A genuinely separate decision** → a new ADR.

## Steps for a new ADR

1. **Next number:** the highest `docs/adr/NNNN-*.md` + 1 (4 digits, no gaps,
   never reused).
2. **File:** `docs/adr/NNNN-kebab-case-title.md`, copied from
   `docs/adr/template.md`.
3. **Header:**
   - Status: `proposed` while under discussion, `accepted` once the owner agrees;
   - Date: today; for a decision made earlier, `YYYY-MM-DD (recorded
     retroactively; in effect since YYYY-MM-DD)`;
   - Scope: `monorepo` or the project's domain (`bmorozov.com`,
     `jobs.bmorozov.com`);
   - Related: other ADR numbers.
4. **Every section:** Context (with dates on facts that can change), Decision
   (imperative, with the rules to follow), Alternatives considered (each with a
   why-not), Consequences (positive, and accepted costs), Enforcement (the check,
   or "convention only"), References. About one screen.
5. **Public by default:** no account IDs, IP addresses, secret values, costs or
   anything personal.
6. **Superseding:** in the old ADR change only the status line, to
   `superseded by [NNNN](NNNN-title.md)`.
7. **Index:** add a row to `docs/adr/README.md`:
   `| [NNNN](NNNN-title.md) | Title | scope | status |`.
8. **Discoverability:** if the ADR covers a new area, add it to the area table
   in the root `AGENTS.md`; if it changes a hard rule, update that rule too.
9. **Verify:** every relative link in the new or changed ADR resolves, numbering
   has no gaps, and the index row is there.

Don't commit. Hand the change to the owner with a suggested message, e.g.
`docs(adr): add ADR-NNNN <title>` or `docs(adr): amend ADR-NNNN <what>`.

# 0006. Contribution workflow: solo, straight to `main`, read-only in public

- Status: accepted
- Date: 2026-09-30 (read-only repository in effect since 2026-09-21)
- Scope: monorepo
- Related: ADR-0001 (decisions), ADR-0005 (delivery)

## Context

The repository has one owner. It's public so people can read how the projects
are built, not so they can contribute. Coding agents work in it with the owner,
and their changes must stay under the owner's control. Team ceremony (pull
requests, templates, branch protection, review sign-offs) exists so that several
people can coordinate; with one owner there's nobody to review a pull request.

## Decision

**Solo, straight to `main`. Public, read-only.**

- **Commit straight to `main`.** No pull requests, no branch protection, no PR
  templates.
- **Small, focused commits in Conventional Commits format**, with the app or
  area as the scope: `feat(bmorozovcom): …`, `fix(jobsbmorozovcom): …`,
  `ci: …`, `docs(adr): …`, `chore(infra): …`.
- A push to `main` deploys the apps it touches (ADR-0005). **A broken deploy or
  a red run is fixed before anything else.**
- **Read-only for everyone else.** Pull request creation is limited to
  collaborators, issues are disabled, and the README says contributions aren't
  accepted. Anyone who spots a real problem can use the contact details on
  bmorozov.com.
- **Agents never commit, push, tag or apply infrastructure**, and add no AI
  attribution (`Co-Authored-By` or similar) anywhere. An agent prepares the
  change, runs the checks, lists the changed files and suggests a commit
  message; the owner commits and pushes.
- **Planned work runs in phases** with exit checks: automated checks run by the
  agent with the real output reported, then a short manual check by the owner.
  The plans themselves are private and stay out of the repository; the
  decisions they produce become ADRs.

## Alternatives considered

- **Pull requests and branch protection anyway.** Ceremony with nobody to
  review; it would slow every change and prove nothing.
- **Accepting outside contributions.** These are personal projects and a
  portfolio; reviewing and maintaining other people's changes isn't the goal.
- **Letting agents commit.** Faster, but the owner would no longer review and
  own every change that lands, and AI attribution would clutter the history.
- **Free-form commit messages.** Harder to scan; Conventional Commits make the
  history readable by app and by kind of change.

## Consequences

Positive:

- Minimal overhead, with every change still reviewed by the owner before it
  lands.
- A readable history by app and by kind of change.

Negative / accepted costs:

- Nothing technically stops a broken commit from reaching `main`, and pushes to
  `main` deploy. Planned: validation in a pre-push hook and in CI before deploys.
- No pull-request discussion record; the reasoning lives in ADRs and commit
  messages.

## Enforcement

- `AGENTS.md` states the agent rules.
- GitHub settings: pull request creation limited to collaborators, issues
  disabled.
- Planned: commitlint in a `commit-msg` hook for the commit format.

## References

- https://www.conventionalcommits.org

## Amendment 2026-09-30: hooks in place

The commit format is now checked by commitlint in the `commit-msg` hook, and
`pnpm validate` runs in the `pre-push` hook (ADR-0007). Validation in CI before
deploys is still planned.

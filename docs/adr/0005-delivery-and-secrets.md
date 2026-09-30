# 0005. Delivery and secrets: per-app workflows, OIDC, ECR, SSM, Parameter Store

- Status: accepted
- Date: 2026-09-30 (recorded retroactively; deploy on push since 2026-09-18,
  secrets through Parameter Store since 2026-09-23, per-app workflows since
  2026-09-25)
- Scope: monorepo
- Related: ADR-0002 (workspace), ADR-0004 (hosting), ADR-0006 (workflow)

## Context

A push to `main` should be the whole release process, with nobody logging into a
server. Each app should deploy only when its own code changes. Some apps need
runtime secrets (bmorozov.com's stats page reads Amplitude with a secret key),
and a secret must never end up in an image, a log, Terraform state or a
command's history.

## Decision

**Each app has a small workflow that calls one shared deploy workflow.**

- **Trigger:** `.github/workflows/deploy-<app>.yml` runs on pushes to `main`
  that touch the app, or on demand. Its `paths` filter lists the app's
  directory, the root workspace files and `packages/` (inputs to every image,
  ADR-0002), its own workflow file and `deploy-app.yml`.
- **Shared steps** live in `deploy-app.yml` (`workflow_call`: app, port, build
  args, runtime secrets):
  1. **Authenticate with OIDC.** The job assumes an AWS role; no AWS keys are
     stored in GitHub. The role's trust is limited to this repository.
  2. **Build** `apps/web/<app>/Dockerfile` from the repository root for
     `linux/amd64`, passing **public** build-time config as build args: the
     commit SHA, and keys that are public by design (Amplitude's browser key).
  3. **Push** to the app's ECR repository (`personal/<app>`), tagged with the
     commit SHA and `latest`. A lifecycle rule keeps the newest 5 images.
  4. **Hand over runtime secrets** (below).
  5. **Deploy through SSM Run Command** on the instance: log in to ECR, pull the
     image, replace the app's container, and publish it on its loopback port.
     The workflow waits for the result and prints it.
- **The commit is visible in production.** The SHA build arg reaches the app,
  which shows it in the footer (bmorozov.com) and sends it to analytics as
  `app_version`.
- **Caddy config deploys separately** (`deploy-caddy.yml`, ADR-0004).

**Runtime secrets travel through Parameter Store, never through the deploy
command.**

- A secret is a GitHub Actions secret, passed to `deploy-app.yml` as
  `NAME=value` lines.
- The workflow writes each to Parameter Store as an encrypted `SecureString`,
  named `/<app>/<name-in-kebab-case>`.
- The deploy command only *names* the parameter. The instance reads it when it
  starts the container and passes it in as an environment variable.
- The value never appears in the SSM command or its history, in a script file
  on the instance, in the image, or in Terraform state (Terraform grants access
  to the parameter; it never holds the value).
- **Access is per parameter.** Terraform lets the deploy role *write* and the
  instance *read* each parameter explicitly, so a new secret needs a Terraform
  change first.

**Least privilege for the deploy role:** push to the apps' ECR repositories;
send commands only to the instance and only with `AWS-RunShellScript`; read
command results; write only the listed parameters.

**Validation gate:** nothing deploys until the checks pass (amendment below).

## Alternatives considered

- **Deploying over SSH.** Needs long-lived keys and an open port 22.
- **Static AWS access keys in GitHub secrets.** Long-lived credentials; OIDC
  issues short-lived ones per run.
- **AWS CodeDeploy.** More moving parts than one SSM command for one host.
- **Pull-based deploys** (the host polls ECR). No feedback in the workflow run
  when a deploy fails.
- **One workflow deploying every app** on any push. Rebuilds and restarts apps
  that didn't change.
- **Secrets as build args.** They'd be baked into the image and its layer
  history.
- **Secrets written into the SSM command.** Used briefly on 2026-09-23. AWS
  keeps command parameters in its Run Command history, and the agent writes
  the script to disk on the instance, so the secret sat in plain text in both
  places.

## Consequences

Positive:

- `git push` is the release. No logins, no manual steps, and each app's history
  of deploys is its workflow runs.
- No long-lived AWS credentials anywhere.
- Rolling back means re-running an older deploy run, which rebuilds that
  commit's image. GitHub allows re-runs for 30 days; older commits are rolled
  back by reverting on `main`.

Negative / accepted costs:

- **A few seconds of downtime per deploy.** The old container is removed before
  the new one starts. Acceptable at this traffic; blue-green is possible later.
- A change to root workspace files redeploys every app (ADR-0002).
- The running container's environment still holds its secrets, as any process
  environment does. Anyone with SSM access to the instance can read them.
- Until 2026-09-30, failing checks could ship; the validation gate (amendment
  below) closed that.

## Enforcement

- Permissions and parameter access are defined in Terraform (`apps/infra`).
- `paths` filters in each `deploy-<app>.yml`.
- Convention: new secrets go through `runtime-env`, never through build args.

## References

- `.github/workflows/deploy-app.yml`, `deploy-<app>.yml`, `deploy-caddy.yml`,
  `checks.yml`, `validate.yml`
- `apps/infra/main.tf` (OIDC provider, roles, ECR, parameter access)
- https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services

## Amendment 2026-09-30: validation gate

- **The checks live in one reusable workflow, `checks.yml`,** with two jobs:
  - `validate`: `pnpm validate` on the Node version in `.nvmrc` (ADR-0007);
  - `visual`: `pnpm test:visual` inside the Playwright image (ADR-0008). When
    it fails, the expected, actual and diff images are attached to the run as
    the `visual-diffs` artifact.
- **Every push to any branch runs them** (`validate.yml`), including pushes that
  deploy nothing, such as docs or infrastructure.
- **Every deploy runs them first.** `deploy-app.yml` calls `checks.yml` for its
  app, with the visual snapshots limited to that app, and the deploy job
  `needs` it. A red check never deploys.
- `checks.yml` is in every deploy workflow's `paths` filter.

A push to `main` runs the checks more than once: in `validate.yml` and in each
app's deploy. Accepted: the runs are parallel, and each deploy stays
self-contained. The alternative, deploying from a `workflow_run` trigger after
`validate.yml` succeeds, runs the checks once but has no `paths` filter, so
every push would redeploy every app.

Enforcement: `needs: checks` in `deploy-app.yml`.

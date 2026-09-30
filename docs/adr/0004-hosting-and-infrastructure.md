# 0004. Hosting: one EC2 host, Caddy, Cloudflare; infrastructure as Terraform

- Status: accepted
- Date: 2026-09-30 (recorded retroactively; in effect since 2026-09-18)
- Scope: monorepo
- Related: ADR-0003 (web stack), ADR-0005 (delivery and secrets)

## Context

The apps are personal projects with low traffic. Part of their purpose is to
show the owner can build and run a working system end to end, including the
infrastructure. Hosting should be cheap, fully understood, reproducible from
code, and able to run several apps side by side.

## Decision

**Run every app as a container on one EC2 instance, behind Caddy, with
Cloudflare in front. Define the AWS side in Terraform.**

- **Host:** one `t3.micro` running Ubuntu 24.04 in `eu-north-1`, with an 8 GB
  gp3 root volume and an Elastic IP, so the address survives restarts.
- **No SSH.** The security group allows inbound 80 and 443 only. The instance
  is managed through AWS Systems Manager (SSM), which is also how deploys reach
  it (ADR-0005).
- **Instance role, least privilege:** pull from ECR, be managed by SSM, and read
  only the Parameter Store entries its apps need (ADR-0005).
- **One container per app**, published on a loopback port only (bmorozov.com
  3000, jobs.bmorozov.com 3001), restarted automatically unless stopped.
- **Caddy** terminates TLS (automatic Let's Encrypt certificates) and
  reverse-proxies each domain to its app's port. The Caddyfile lives in
  `apps/infra/Caddyfile`:
  - a new instance gets it from cloud-init;
  - the running instance gets changes from `deploy-caddy.yml`, which runs
    `caddy validate` before swapping the file in, so a bad config can't take
    the sites down.
- **Cloudflare** provides DNS and proxies traffic to the instance. It's managed
  in Cloudflare, not in Terraform.
- **Terraform** (`apps/infra/main.tf`) defines the instance, security group,
  roles and policies, the ECR repositories, the Elastic IP and the GitHub OIDC
  provider:
  - **local state**, git-ignored and excluded from Docker build contexts;
  - **applied by hand** by the owner after reading `terraform plan`;
  - `lifecycle.ignore_changes = [ami, user_data]` on the instance. Otherwise
    each new Ubuntu image, and each Caddyfile change (it's part of `user_data`),
    would *replace the running server*. Both take effect only when the instance
    is created from scratch.

## Alternatives considered

- **Vercel or another managed Next.js host.** The simplest option, but it would
  hide exactly the infrastructure these projects exist to show.
- **ECS Fargate or App Runner** behind a load balancer. Managed and scalable,
  but at this traffic the load balancer alone costs more than the whole
  instance.
- **Kubernetes.** Operational overhead with no benefit at this size.
- **nginx with certbot** instead of Caddy. Works, but TLS renewal is a separate
  moving part; Caddy handles it itself.
- **TLS only at Cloudflare**, with plain HTTP to the origin. Caddy keeps the
  Cloudflare-to-origin hop encrypted as well.
- **Remote Terraform state** (S3 with locking). The right choice with more than
  one operator or automated applies. With one owner applying by hand, local
  state is simpler. Revisit if either changes.

## Consequences

Positive:

- Cheap and fully understood; the whole setup reads from `apps/infra`.
- Adding an app means a port, a Caddyfile site, an ECR repository and a
  workflow; no new infrastructure.
- No SSH keys to manage, and no inbound port besides 80 and 443.

Negative / accepted costs:

- **One host is a single point of failure.** An instance problem takes every
  app down. Accepted for personal projects.
- **1 GB of RAM** limits how many apps fit. Watch memory as apps are added.
- A deploy restarts the app's container, a few seconds of downtime (ADR-0005).
- The instance's OS image is whatever it was created with. Moving to a newer
  image is deliberate: `terraform apply -replace=aws_instance.bmorozovcom`, then
  a deploy.
- Local state lives on one machine. Losing it means re-importing the resources.

## Enforcement

- Agents never run `terraform apply`. They may run `terraform plan`, which is
  read-only, and report the result; the owner applies.
- A plan that replaces or destroys the instance is a stop sign, to be explained
  before anyone applies it.
- `deploy-caddy.yml` validates the Caddyfile before installing it.

## References

- `apps/infra/main.tf`, `apps/infra/cloud-init.sh.tftpl`, `apps/infra/Caddyfile`
- `.github/workflows/deploy-caddy.yml`
- https://caddyserver.com/docs/automatic-https

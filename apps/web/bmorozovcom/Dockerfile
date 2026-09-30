# syntax=docker/dockerfile:1

# Build from the REPO ROOT, pointing at this file:
#
#   docker build -f apps/web/bmorozovcom/Dockerfile -t bmorozovcom .
#
# The app is a package in the root pnpm workspace, so the context is the root
# (the lockfile and workspace config live there) and the image mirrors the
# repo layout under /app. Every COPY below is therefore root-relative.

FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NEXT_TELEMETRY_DISABLED=1
# sharp (Next's image optimizer) wants glibc compatibility shims on Alpine.
RUN apk add --no-cache libc6-compat && corepack enable
WORKDIR /app

# ---- dependencies -----------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/bmorozovcom/package.json ./apps/web/bmorozovcom/
# Shared workspace packages (ADR-0002). Config only today, so they're copied
# whole; once one holds code, copy just its package.json here and the rest in
# the build stage, so code changes don't invalidate the install layer.
COPY packages/ ./packages/
# --ignore-scripts: the root `prepare` script installs git hooks, and there's no
# git here. Dependency build scripts are off anyway (pnpm-workspace.yaml).
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts --filter bmorozovcom...

# ---- build ------------------------------------------------------------------
FROM base AS builder
# The commit this image was built from. NEXT_PUBLIC_* is inlined by next build,
# so the footer carries the SHA of the code it was actually built from.
ARG GIT_SHA
ENV NEXT_PUBLIC_GIT_SHA=$GIT_SHA
# Amplitude browser keys ship to every visitor, so this is config, not a secret.
# Unset = analytics off.
ARG AMPLITUDE_API_KEY
ARG AMPLITUDE_SERVER_ZONE=US
ENV NEXT_PUBLIC_AMPLITUDE_API_KEY=$AMPLITUDE_API_KEY
ENV NEXT_PUBLIC_AMPLITUDE_SERVER_ZONE=$AMPLITUDE_SERVER_ZONE
COPY --from=deps /app ./
COPY apps/web/bmorozovcom/ ./apps/web/bmorozovcom/
WORKDIR /app/apps/web/bmorozovcom
RUN pnpm build

# ---- run --------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

# server.js plus its traced dependencies, laid out from the repo root; static
# assets and public/ are not included in the standalone output and have to be
# copied alongside it.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/bmorozovcom/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/bmorozovcom/.next/static ./apps/web/bmorozovcom/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/bmorozovcom/public ./apps/web/bmorozovcom/public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://127.0.0.1:3000/ || exit 1

CMD ["node", "apps/web/bmorozovcom/server.js"]

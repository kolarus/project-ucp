# syntax=docker/dockerfile:1

# Build from the REPO ROOT, pointing at this file:
#
#   docker build -f apps/web/jobsbmorozovcom/Dockerfile -t jobsbmorozovcom .
#
# The app is a package in the root pnpm workspace, so the context is the root
# (the lockfile and workspace config live there) and the image mirrors the
# repo layout under /app. Every COPY below is therefore root-relative.

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NEXT_TELEMETRY_DISABLED=1
# sharp (Next's image optimizer) wants glibc compatibility shims on Alpine.
RUN apk add --no-cache libc6-compat && corepack enable
WORKDIR /app

# ---- dependencies -----------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/jobsbmorozovcom/package.json ./apps/web/jobsbmorozovcom/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter jobsbmorozovcom...

# ---- build ------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app ./
COPY apps/web/jobsbmorozovcom/ ./apps/web/jobsbmorozovcom/
WORKDIR /app/apps/web/jobsbmorozovcom
# public/ isn't in git until the app has static assets; the runner copies it.
RUN mkdir -p public && pnpm build

# ---- run --------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

# server.js plus its traced dependencies, laid out from the repo root; static
# assets and public/ are not included in the standalone output and have to be
# copied alongside it.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/jobsbmorozovcom/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/jobsbmorozovcom/.next/static ./apps/web/jobsbmorozovcom/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/jobsbmorozovcom/public ./apps/web/jobsbmorozovcom/public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://127.0.0.1:3000/ || exit 1

CMD ["node", "apps/web/jobsbmorozovcom/server.js"]

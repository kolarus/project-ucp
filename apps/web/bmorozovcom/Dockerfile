# syntax=docker/dockerfile:1

# Build from the REPO ROOT, pointing at this file:
#
#   docker build -f apps/web/bmorozovcom/Dockerfile -t bmorozovcom .
#
# The context is the root so root-level manifests and any future shared
# packages are reachable; every COPY below is therefore root-relative. The
# app is flattened into /app rather than reproducing its path in the image.

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NEXT_TELEMETRY_DISABLED=1
# sharp (Next's image optimizer) wants glibc compatibility shims on Alpine.
RUN apk add --no-cache libc6-compat && corepack enable
WORKDIR /app

# ---- dependencies -----------------------------------------------------------
FROM base AS deps
COPY apps/web/bmorozovcom/package.json \
     apps/web/bmorozovcom/pnpm-lock.yaml \
     apps/web/bmorozovcom/pnpm-workspace.yaml \
     ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

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
COPY --from=deps /app/node_modules ./node_modules
COPY apps/web/bmorozovcom/ ./
RUN pnpm build

# ---- run --------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

# server.js plus its traced dependencies; static assets and public/ are not
# included in the standalone output and have to be copied alongside it.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]

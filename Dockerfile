# Build stage — Node + pnpm, produces the standalone server bundle
FROM node:22-alpine AS builder
WORKDIR /app

# corepack pins pnpm to the version declared in package.json ("packageManager")
RUN corepack enable pnpm

# Install dependencies first so they are cached as their own layer,
# invalidated only when the lockfile changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so they
# must arrive as build arguments — set them per environment when building the
# image (see .env.example for what each one does).
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SUPPORT_EMAIL
ARG NEXT_PUBLIC_SUPPORT_WHATSAPP

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# Production stage — standalone server only, no node_modules or build tools
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# Run as the unprivileged user shipped with the base image
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node

EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

CMD ["node", "server.js"]

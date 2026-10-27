# Next.js storefront — build from the REPO ROOT:
#   docker build -f apps/storefront/Dockerfile .
#
# NEXT_PUBLIC_* values are baked into the client bundle at build time, so
# they are build args, not runtime env.

FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
COPY apps/storefront/package.json apps/storefront/
COPY packages/types/package.json packages/types/
COPY packages/config/package.json packages/config/
RUN npm ci --workspace @ecommerce/storefront --no-audit --no-fund

COPY packages packages
COPY apps/storefront apps/storefront

ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL \
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app/apps/storefront
RUN npx next build

# ---------------------------------------------------------------------------
FROM node:20-bookworm-slim
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
WORKDIR /app

# Standalone output: minimal server + only the node_modules it traces.
COPY --from=build --chown=node:node /app/apps/storefront/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/storefront/.next/static ./apps/storefront/.next/static
COPY --from=build --chown=node:node /app/apps/storefront/public ./apps/storefront/public

USER node
EXPOSE 3000
CMD ["node", "apps/storefront/server.js"]

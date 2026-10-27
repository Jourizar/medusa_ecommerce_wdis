# Medusa backend — build from the REPO ROOT so the workspace lockfile is used:
#   docker build -f apps/medusa-backend/Dockerfile .

FROM node:20-bookworm-slim AS build
WORKDIR /app

# Install deps for this workspace only, from the root lockfile.
COPY package.json package-lock.json .npmrc ./
COPY apps/medusa-backend/package.json apps/medusa-backend/
COPY packages/types/package.json packages/types/
COPY packages/config/package.json packages/config/
# Root deps are included: the admin dashboard build needs the root React.
RUN npm ci --workspace @ecommerce/medusa-backend --include-workspace-root --no-audit --no-fund

COPY packages packages
COPY apps/medusa-backend apps/medusa-backend
WORKDIR /app/apps/medusa-backend
# Builds the server and the admin dashboard into .medusa/server.
RUN npx medusa build

# ---------------------------------------------------------------------------
FROM node:20-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app

# Hoisted workspace deps; Node resolves them by walking up from the server dir.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/medusa-backend/.medusa/server ./server
COPY apps/medusa-backend/docker-entrypoint.sh /usr/local/bin/

WORKDIR /app/server
# Product image uploads live here; mount a volume to persist them.
RUN mkdir -p static && chown -R node:node /app/server
USER node

EXPOSE 9000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npx", "medusa", "start"]

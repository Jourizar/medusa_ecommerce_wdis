#!/usr/bin/env bash
# Pull the latest code and rebuild/restart the stack. Run from the repo root
# on the server:  bash deploy/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env.production ]; then
  echo "Missing .env.production — copy .env.production.example and fill it in." >&2
  exit 1
fi

COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.production"

git pull --ff-only

# Build one image at a time so the two builds don't compete for RAM.
$COMPOSE build medusa
$COMPOSE build storefront
$COMPOSE up -d --remove-orphans

# Reclaim disk from old image layers.
docker image prune -f >/dev/null

$COMPOSE ps

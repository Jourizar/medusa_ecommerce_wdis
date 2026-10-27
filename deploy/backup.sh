#!/usr/bin/env bash
# Dump the database and uploaded images into ./backups, keeping 14 days.
# Runs daily from cron (installed by setup-server.sh). Restore with:
#   gunzip -c backups/db-<date>.sql.gz | docker compose -f docker-compose.prod.yml \
#     --env-file .env.production exec -T postgres psql -U medusa -d medusa
set -euo pipefail
cd "$(dirname "$0")/.."

COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.production"
STAMP=$(date +%Y-%m-%d_%H%M)
mkdir -p backups

$COMPOSE exec -T postgres pg_dump -U medusa -d medusa --clean --if-exists \
  | gzip > "backups/db-$STAMP.sql.gz"

$COMPOSE exec -T medusa tar -czf - -C /app/server static \
  > "backups/static-$STAMP.tar.gz"

find backups -name "*.gz" -mtime +14 -delete

echo "$(date -Is) backup ok: db-$STAMP.sql.gz static-$STAMP.tar.gz"

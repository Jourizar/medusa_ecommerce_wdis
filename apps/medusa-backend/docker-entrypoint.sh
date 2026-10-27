#!/bin/sh
set -e

# Apply pending migrations (core + custom modules) before every start.
# Safe to re-run: already-applied migrations are skipped.
npx medusa db:migrate

exec "$@"

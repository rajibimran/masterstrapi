#!/usr/bin/env bash
# Restore PostgreSQL baseline into the database pointed at by DATABASE_URL.
# Usage:
#   export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
#   export BASELINE_DUMP_PATH="/secure/path/baseline.dump"
#   bash scripts/restore-db.sh
#
# Requires: pg_restore (PostgreSQL client tools).
# Do not commit baseline.dump to public GitHub — store in private storage or CI artifacts.

set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required (postgresql://...)" >&2
  exit 1
fi

if [[ -z "${BASELINE_DUMP_PATH:-}" ]]; then
  echo "BASELINE_DUMP_PATH is required (path to baseline.dump from pg_dump -Fc)" >&2
  exit 1
fi

if [[ ! -f "$BASELINE_DUMP_PATH" ]]; then
  echo "File not found: $BASELINE_DUMP_PATH" >&2
  exit 1
fi

echo "==> pg_restore into target database (clean + if-exists)"
pg_restore --clean --if-exists --no-owner --no-acl -d "$DATABASE_URL" "$BASELINE_DUMP_PATH"

echo "==> Done. Set DATABASE_CLIENT=postgres in .env and start Strapi."

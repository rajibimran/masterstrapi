#!/usr/bin/env bash
# One-time (or periodic) custom dump for backups / golden images.
# Produces a compressed custom-format dump suitable for pg_restore.
#
# Usage:
#   export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
#   export BASELINE_DUMP_PATH="./backups/baseline-$(date +%Y%m%d).dump"
#   mkdir -p "$(dirname "$BASELINE_DUMP_PATH")"
#   bash scripts/baseline-dump.sh
#
# Store the resulting .dump in private storage — not in a public repo.

set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

if [[ -z "${BASELINE_DUMP_PATH:-}" ]]; then
  echo "BASELINE_DUMP_PATH is required (output file path)" >&2
  exit 1
fi

mkdir -p "$(dirname "$BASELINE_DUMP_PATH")"

echo "==> pg_dump -Fc -> $BASELINE_DUMP_PATH"
pg_dump -Fc -d "$DATABASE_URL" -f "$BASELINE_DUMP_PATH"

echo "==> Done."

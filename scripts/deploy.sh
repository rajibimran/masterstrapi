#!/usr/bin/env bash
# Deploy unvback on Linux/macOS: install deps, build admin+server, start production.
# Usage: from repo root — bash scripts/deploy.sh
# Optional: export PORT=1337 (default from .env)

set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env — copy .env.example to .env and fill secrets + database." >&2
  exit 1
fi

echo "==> npm ci"
npm ci

echo "==> npm run build"
npm run build

echo "==> npm run start (foreground — use systemd/pm2 in production)"
exec npm run start

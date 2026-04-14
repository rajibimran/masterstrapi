# Deploy `unvback` (Strapi v5)

Minimal path from **empty Linux server** to a running API. Adjust hostnames, users, and paths to match your environment.

## Prerequisites

- Node.js **20–24** (matches Strapi engines in `package.json`)
- **Default:** nothing extra — **SQLite** file under `.tmp/` (see `.env.example`)
- **PostgreSQL (optional):** Postgres 14+ when `DATABASE_CLIENT=postgres`, plus client tools (`pg_dump`, `pg_restore`) on machines that run `baseline-dump.sh` / `restore-db.sh`

## One-time secrets (never commit `.env`)

1. Copy the template:

   ```bash
   cp .env.example .env
   ```

2. Generate strong random values for: `APP_KEYS` (comma-separated), `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`.

3. **Database** in `.env` (see `.env.example`):
   - **SQLite (default):** `DATABASE_CLIENT=sqlite` and optional `DATABASE_FILENAME=.tmp/data.db`
   - **PostgreSQL:** `DATABASE_CLIENT=postgres` plus either `DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME` or discrete `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`

4. Set `HOST` / `PORT` as needed (often `PORT=1337` behind Nginx).

## Golden image workflow (PostgreSQL only)

Use this when `DATABASE_CLIENT=postgres`. For SQLite-only deploys, copy `.tmp/data.db` + `public/uploads/` instead (or rely on `npm run seed:full`).

| Artifact | Where to keep it |
|----------|------------------|
| Git repo | Code + `config/` + `src/` + scripts + `.env.example` |
| `baseline.dump` | **Private** storage (S3, vault, internal artifact) — **not** public GitHub |
| `public/uploads` | Same as dump, or move to S3-compatible storage later |

### A) Create baseline dump (Postgres; machine with the golden DB)

```bash
export DATABASE_URL="postgresql://strapi:****@localhost:5432/strapi_prod"
export BASELINE_DUMP_PATH="$HOME/secure/unvback-baseline.dump"
mkdir -p "$(dirname "$BASELINE_DUMP_PATH")"
bash scripts/baseline-dump.sh
```

### B) New server — 10 commands (copy/paste)

**SQLite:** skip steps **4–5** (no Postgres / no `pg_restore`). Ensure `.env` uses `DATABASE_CLIENT=sqlite`.

```bash
# 1) App user & directory
sudo adduser --disabled-password strapi || true
sudo mkdir -p /opt/unvback && sudo chown strapi:strapi /opt/unvback
sudo -u strapi -H bash -lc 'cd /opt/unvback && pwd'

# 2) Clone (replace URL)
sudo -u strapi -H git clone https://github.com/YOUR_ORG/unvback.git /opt/unvback
cd /opt/unvback

# 3) Environment
cp .env.example .env
nano .env   # fill secrets; use sqlite defaults or set DATABASE_CLIENT=postgres + URL/fields

# 4) Create empty database (example — use your admin SQL)
# sudo -u postgres psql -c "CREATE USER strapi WITH PASSWORD '***';"
# sudo -u postgres psql -c "CREATE DATABASE strapi OWNER strapi;"

# 5) Restore baseline (private dump path)
export DATABASE_URL="postgresql://strapi:***@127.0.0.1:5432/strapi"
export BASELINE_DUMP_PATH="/path/to/baseline.dump"
bash scripts/restore-db.sh

# 6) Install & build
npm ci
npm run build

# 7) (Optional) Demo content + media — downloads placeholders from the internet
npm run seed:full

# 8) Process manager (example: PM2)
# npm i -g pm2
# pm2 start npm --name unvback -- start

# 9) Reverse proxy + TLS (Nginx/Caddy) → proxy_pass http://127.0.0.1:1337

# 10) Smoke test
curl -sS "http://127.0.0.1:1337/api/site-config?populate=*" | head
```

### Windows (PowerShell) quick path

```powershell
cd D:\path\to\unvback
Copy-Item .env.example .env
# edit .env — sqlite default, or postgres + DATABASE_URL / discrete fields
npm ci
npm run build
npm run seed:full   # optional
npm run start
```

Or run the bundled script:

```powershell
.\scripts\deploy.ps1
```

## Scripts reference

| Script | Purpose |
|--------|---------|
| `scripts/deploy.sh` | `npm ci` → `build` → `start` (foreground) |
| `scripts/deploy.ps1` | Same on Windows |
| `scripts/restore-db.sh` | `pg_restore` from `BASELINE_DUMP_PATH` into `DATABASE_URL` |
| `scripts/baseline-dump.sh` | `pg_dump -Fc` golden database to `BASELINE_DUMP_PATH` |
| `npm run seed:full` | Rebuilds `dist` via Strapi compiler, then fills **every** collection + singles with sample text and uploads images/PDF/video (destructive on collections — see `scripts/seed-full.cjs`) |

## Database

- **SQLite (default):** file at `DATABASE_FILENAME` (default `.tmp/data.db`). Fine for local dev and small single-instance deployments. Back up the file and `public/uploads/` together.
- **PostgreSQL:** set `DATABASE_CLIENT=postgres` and connection vars. Create an empty DB (or restore `baseline.dump`) before first `npm run start`. Use for production when you need a server-grade DB, multiple app instances, or Strapi transfer targets.

## Website-type → content types & APIs

See **[docs/CONTENT_BY_WEBSITE_TYPE.md](docs/CONTENT_BY_WEBSITE_TYPE.md)** for which collection types to use or hide per industry (portfolio, clinic, recruitment, etc.) and the matching `GET /api/...` patterns.

## Docker

- **SQLite (default):** `cp .env.example .env`, set secrets, then `docker compose up --build` from this directory. API: `http://localhost:1337`.
- **PostgreSQL:** `docker compose --profile postgres up --build` and merge `.env.docker-postgres.example` into `.env` (plus real secrets). Strapi connects to the `postgres` service on the compose network.

Images use **Node 20 Alpine**; data persists in named volumes (`strapi_tmp`, `strapi_uploads`; plus `postgres_data` when the profile is used).

## GitHub

See **[GITHUB.md](./GITHUB.md)** to add `origin` and push (this repo is not pre-linked to your account).

## Read-only API token (frontend)

Create a **read-only** API token in **Admin → Settings → API Tokens**, scope it to required content types, and send:

`Authorization: Bearer <token>`

Do not commit tokens to Git.

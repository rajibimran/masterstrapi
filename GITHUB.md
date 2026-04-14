# Push `unvback` to GitHub

This folder is a standalone Git repo (`master`). GitHub cannot be linked from here without **your** account and repo URL.

## 1) Create an empty repository on GitHub

1. Open [https://github.com/new](https://github.com/new)
2. Repository name (examples): `unvback`, `strapi-universal-backend`, or your org standard.
3. **Do not** add README / .gitignore / license (this project already has them).
4. Create the repo and copy the **HTTPS** or **SSH** URL, e.g.  
   `https://github.com/YOUR_ORG/unvback.git`

## 2) Add remote and push (first time)

From `d:\dev\uniweb\unvback` (or your clone path):

```bash
git remote add origin https://github.com/YOUR_ORG/unvback.git
git branch -M main
git push -u origin main
```

If the local branch is still `master`:

```bash
git remote add origin https://github.com/YOUR_ORG/unvback.git
git push -u origin master
```

Use **GitHub CLI** if you prefer:

```bash
gh repo create YOUR_ORG/unvback --private --source=. --remote=origin --push
```

## 3) Never commit secrets

- `.env` is gitignored — keep it local / CI secrets only.
- Commit `.env.example`, `.env.docker-postgres.example` as templates only.

## 4) Client / server deploy after clone

- **Docker:** see root `Dockerfile`, `docker-compose.yml`, and [DEPLOY.md](./DEPLOY.md).
- **Bare metal:** `npm ci`, `npm run build`, `npm run start` with `.env` on the server.

## 5) Optional: Git LFS

Only if you commit large binaries under `public/uploads` (not recommended). Prefer external object storage for production media.

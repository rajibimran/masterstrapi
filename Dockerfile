# Strapi v5 — production image (Node 20 LTS, Alpine)
# Build: docker build -t unvback:latest .
# Run:  see docker-compose.yml or DEPLOY.md

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /opt/app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /opt/app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build && npm prune --omit=dev

FROM base AS runner
WORKDIR /opt/app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337

RUN addgroup --system --gid 1001 strapi && adduser --system --uid 1001 strapi
COPY --from=builder --chown=strapi:strapi /opt/app ./

USER strapi
EXPOSE 1337

# Persist SQLite DB + uploads with volumes (see docker-compose.yml)
VOLUME ["/opt/app/.tmp", "/opt/app/public/uploads"]

CMD ["npm", "run", "start"]

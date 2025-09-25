# ---------- Base Stage ----------
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.7.1 --activate

# ---------- Dependencies Stage ----------
FROM base AS deps

COPY pnpm-lock.yaml package.json turbo.json pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/

RUN pnpm install --frozen-lockfile --filter ./apps/server...

# ---------- Build Stage ----------
FROM deps AS builder

WORKDIR /app/apps/server
COPY apps/server/ .

RUN pnpm run db:generate && pnpm run build

# ---------- Run Stage ----------
FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@9.7.1 --activate

WORKDIR /app/apps/server
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/package.json ./
COPY --from=builder /app/apps/server/prisma ./prisma

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/server/node_modules ./node_modules

EXPOSE 8080
CMD ["pnpm", "start"]

# ---------- Base Stage ----------
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.7.1 --activate

# ---------- Dependencies Stage ----------
FROM base AS deps

COPY pnpm-lock.yaml package.json turbo.json pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/

RUN pnpm install --frozen-lockfile --filter ./apps/web...

# ---------- Build Stage ----------
FROM deps AS builder

WORKDIR /app/apps/web
COPY apps/web/ .
RUN pnpm run build

# ---------- Run Stage ----------
FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@9.7.1 --activate

WORKDIR /app/apps/web
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/package.json ./
COPY --from=builder /app/apps/web/public ./public

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/web/node_modules ./node_modules

EXPOSE 8080
CMD ["pnpm", "start"]
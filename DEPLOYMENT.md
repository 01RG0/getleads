# LeadScale Deployment Guide

## Services Overview

| Service | Purpose | Folder | URL |
|---------|---------|--------|-----|
| **Vercel** | Next.js frontend + marketing | `/` (root) | `your-app.vercel.app` |
| **Railway** | Fastify API + BullMQ workers | `/backend` | `your-backend.railway.app` |
| **Supabase** | PostgreSQL database | schema at `/schema.prisma` | Supabase dashboard |
| **Upstash** | Redis caching + queues | clients in `/lib/redis.ts` + `/backend/src/lib/redis.ts` | Upstash console |

---

## 1. Supabase Setup

1. Create project at https://supabase.com
2. Go to **Settings → Database → Connection string**
3. Copy the **connection pooler URI** (port 6543) → set as `DATABASE_URL`
4. Copy the **direct connection URI** (port 5432) → set as `DIRECT_URL`
5. Go to **Settings → API** → copy `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (never expose publicly)
7. Run migrations:
   ```bash
   # From repo root
   pnpm add -D prisma
   DATABASE_URL="..." DIRECT_URL="..." npx prisma migrate deploy
   ```

---

## 2. Upstash Redis Setup

1. Create database at https://upstash.com/redis
2. Select **Regional** (pick closest to Railway region)
3. Enable **TLS** (required for production)
4. Copy **REST URL** → `UPSTASH_REDIS_REST_URL`
5. Copy **REST Token** → `UPSTASH_REDIS_REST_TOKEN`
6. Copy **Redis URL** (starts with `rediss://`) → `REDIS_URL` (backend only, for BullMQ)

---

## 3. Railway Backend Setup

1. Go to https://railway.app → New Project → Deploy from GitHub
2. Select this repo, set **root directory** to `/backend`
3. Railway auto-detects the `Dockerfile`
4. Add all variables from `backend/.env.example` in Railway dashboard
5. Enable **Private Networking** if connecting to Supabase via private IP

**Required Railway env vars:**
```
DATABASE_URL
DIRECT_URL
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
REDIS_URL
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-app.vercel.app
API_SECRET_KEY
```

---

## 4. Vercel Frontend Setup

1. Go to https://vercel.com → New Project → Import from GitHub
2. Select this repo, leave **root directory** as `/` (default)
3. Framework preset: **Next.js** (auto-detected)
4. Add environment variables (see `.env.example` for full list)

**Required Vercel env vars:**
```
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_API_URL          ← set to your Railway backend URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
DATABASE_URL
DIRECT_URL
SUPABASE_SERVICE_ROLE_KEY
NEXTAUTH_SECRET
API_SECRET_KEY
```

---

## 5. Install Packages

### Root (Vercel/Next.js):
```bash
pnpm add @supabase/supabase-js @upstash/redis @prisma/client
pnpm add -D prisma
```

### Backend (Railway):
```bash
cd backend
pnpm install
```

---

## 6. Local Development

```bash
# 1. Copy env example
cp .env.example .env.local

# 2. Fill in your Supabase + Upstash credentials

# 3. Run database migrations
npx prisma migrate dev

# 4. Start frontend
pnpm dev

# 5. Start backend (separate terminal)
cd backend && pnpm dev
```

---

## Service → File Mapping

| What it does | File | Service |
|---|---|---|
| Supabase client (browser) | `lib/supabase.ts` | Vercel |
| Prisma client singleton | `lib/db.ts` | Vercel (SSR/API routes) |
| Redis cache (frontend) | `lib/redis.ts` | Vercel (Edge/Serverless) |
| Fastify server entry | `backend/src/index.ts` | Railway |
| Prisma client (backend) | `backend/src/lib/db.ts` | Railway |
| Redis + rate limiter | `backend/src/lib/redis.ts` | Railway |
| BullMQ queues | `backend/src/lib/queue.ts` | Railway |
| Database schema | `schema.prisma` | Supabase (via Prisma) |
| Backend config | `backend/railway.json` | Railway |
| Frontend config | `vercel.json` | Vercel |

# Backend Server Provider Guide

The LeadScale backend is a standard Docker container. It runs identically on any provider.
The only thing that changes between providers is the deploy config file.

> **Note for developers:** `src/index.ts` should import `config` from `./config.js` instead of
> reading `process.env` directly. All env var access is centralised in `src/config.ts`.

## Supported Providers

| Provider | Config File | Free Tier | Notes |
|----------|------------|-----------|-------|
| **Railway** | `railway.json` | $5/month hobby | Easiest setup — auto-deploys from GitHub |
| **Fly.io** | `fly.toml` | 3 shared VMs free | Best geographic distribution; `fly deploy` CLI |
| **Render** | `render.yaml` | Free (spins down) / $7 starter | render.yaml auto-sync on push |
| **DigitalOcean** | `.do/app.yaml` | $5/month basic | App Platform — zero infra management |
| **Self-hosted VPS** | `docker-compose.yml` | Free (Oracle/Hetzner) | Full control; use with Oracle Always Free VMs |
| **Heroku / any Procfile** | `Procfile` | Eco dynos $5/month | Legacy; Procfile works on Railway too |

## Switching Providers

No code changes required. All config is in environment variables via `src/config.ts`.

### From Railway → Fly.io
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. `fly auth login`
3. From `backend/` directory: `fly launch --config fly.toml`
4. Set secrets: `fly secrets set DATABASE_URL="..." UPSTASH_REDIS_REST_URL="..." ...`
5. Deploy: `fly deploy`
6. Update `CORS_ORIGIN` on Vercel to your new Fly.io URL
7. Update `NEXT_PUBLIC_API_URL` in Vercel dashboard to the new backend URL

### From Railway → Render
1. Connect GitHub repo at render.com
2. Set root directory to `/backend`
3. Render detects `render.yaml` automatically
4. Add env vars in Render dashboard (see `backend/.env.example`)
5. Update `CORS_ORIGIN` and `NEXT_PUBLIC_API_URL` on Vercel

### From Railway → Self-hosted VPS (Oracle Cloud Always Free)
1. SSH into your Oracle VM
2. Install Docker: `curl -fsSL https://get.docker.com | sh`
3. Clone repo: `git clone your-repo && cd your-repo/backend`
4. Create `.env` from `.env.example` and fill in credentials
5. `docker compose up -d`
6. Set up Nginx reverse proxy for HTTPS (certbot for free TLS)
7. Update `CORS_ORIGIN` and `NEXT_PUBLIC_API_URL` on Vercel

### From Railway → DigitalOcean App Platform
1. Go to cloud.digitalocean.com → App Platform → New App
2. Connect GitHub, select this repo, set source dir to `/backend`
3. DigitalOcean detects `.do/app.yaml` — update `github.repo` to your repo path first
4. Add secrets in the App Platform dashboard
5. Update `CORS_ORIGIN` and `NEXT_PUBLIC_API_URL` on Vercel

## Environment Variables

All providers need the same env vars. See `backend/.env.example` for the full list.

`src/config.ts` validates required vars on startup — the server will **refuse to start**
with a clear error message if any required var is missing, rather than failing silently at runtime.

Required vars on every provider:
```
DATABASE_URL
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
REDIS_URL
API_SECRET_KEY
```

Optional but recommended:
```
DIRECT_URL       (needed for prisma migrate deploy)
CORS_ORIGIN      (defaults to * — set to your Vercel URL in production)
PORT             (defaults to 3001)
HOST             (defaults to 0.0.0.0)
```

## Health Check

All provider configs point to `GET /health`. The endpoint returns:
```json
{ "status": "ok", "service": "leadscale-backend", "timestamp": "2026-08-15T..." }
```

Redis health: `GET /health/redis` — confirms Upstash connectivity.

## Scaling

The backend is fully stateless (all state in Supabase + Upstash). Scale horizontally by
increasing instance count in your provider's dashboard — no code changes needed.

BullMQ workers can run as separate services on any provider, pointing to the same
Upstash Redis instance via `REDIS_URL`.

## Local Development

```bash
cd backend
cp .env.example .env       # fill in real credentials
pnpm install
pnpm dev                   # tsx watch src/index.ts on port 3001
```

Or with Docker Compose (includes local Redis):
```bash
cd backend
docker compose up          # spins up backend + Redis on ports 3001 + 6379
docker compose --profile debug up   # also starts Bull Board UI on port 3002
```

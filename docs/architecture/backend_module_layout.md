# Backend Module Layout & Gap Analysis
## LeadScale — Fastify/TypeScript on Railway

> **Status:** Pre-implementation review. No code changes made yet.  
> **Budget constraint:** $0 — free-tier APIs and open-source tools only.  
> **Approach:** Refactor / extend existing code. Do not rewrite what works.

---

## 1. Gap Analysis

### 1.1 What's fully implemented and working

| Module | Files | Status |
|--------|-------|--------|
| `enrichment` | service, providers (snov/pdl/tomba/firmographic), routes, worker | ✅ Complete |
| `llm` | router, openai-compat provider, routes, types | ✅ Complete |
| `campaigns` | service, routes | ✅ Complete |
| `tenancy/middleware` | apiKey.ts (SHA-256, expiry, lastUsedAt) | ✅ Complete |
| `lib/db` | Prisma client singleton | ✅ Complete |
| `lib/redis` | Upstash client, getCache/setCache/deleteCache | ✅ Complete |
| `lib/queue` | BullMQ enrichment + verification queues, IORedis connection | ✅ Complete |

### 1.2 What's a skeleton (code exists, but not functional)

| Module | File | Gap |
|--------|------|-----|
| `verification/worker.ts` | Exists | Loops emails, returns `status: 'queued'` — no actual verification called |
| `tenancy/routes.ts` | Exists | Empty stub — no workspace management routes |
| `osint/routes.ts` | Exists | Empty stub — no OSINT routes |
| `verification/routes.ts` | Exists | Empty stub — no verification routes |

### 1.3 Critical wiring missing from `index.ts`

`src/index.ts` registers zero module routes. All routes return 404.  
Workers are never started (`startEnrichmentWorker`, `startVerificationWorker` never called).

**These two fixes unblock everything that's already built:**
1. Register all module routes via `app.register()`
2. Call `startEnrichmentWorker()` and `startVerificationWorker()` after server starts

### 1.4 Documented but not built

| Feature | Docs location | Missing |
|---------|--------------|---------|
| Email verification engine | `docs/features/email-verification-engine.md` | Syntax/MX check, Mailcheck.ai, ZeroBounce calls |
| OSINT worker fleet | `docs/features/osint-worker-fleet.md` | theHarvester subprocess, Serper.dev Maps query |
| Agency multi-tenancy | `docs/features/agency-multi-tenancy.md` | Workspace CRUD, member invite, credit allocation routes |
| Phone verification | `docs/INTEGRATION_PRIORITY.md` §2 | NumVerify call (100/mo free, no CC) |
| LLM providers seed | `docs/features/multi-llm-gateway-router.md` | No Prisma seed data for Groq/Gemini/DeepSeek free tiers |
| Proxy rotation | `docs/INTEGRATION_PRIORITY.md` §1 | ScraperAPI wrapper (5k req/mo free) |

---

## 2. Folder Structure — Current vs. Target

### Current
```
backend/src/
├── config.ts
├── index.ts                  ← registers NO routes, starts NO workers
├── lib/
│   ├── db.ts                 ✅
│   ├── redis.ts              ✅
│   └── queue.ts              ✅
└── modules/
    ├── campaigns/
    │   ├── routes.ts         ✅
    │   └── service.ts        ✅
    ├── enrichment/
    │   ├── providers/
    │   │   ├── base.ts       ✅
    │   │   ├── firmographic.ts ✅
    │   │   ├── pdl.ts        ✅
    │   │   ├── snov.ts       ✅
    │   │   └── tomba.ts      ✅
    │   ├── routes.ts         ✅
    │   ├── service.ts        ✅
    │   └── worker.ts         ✅
    ├── llm/
    │   ├── providers/
    │   │   └── openai-compat.ts ✅
    │   ├── router.ts         ✅
    │   ├── routes.ts         ✅
    │   └── types.ts          ✅
    ├── osint/
    │   └── routes.ts         ⬜ empty stub
    ├── tenancy/
    │   ├── middleware/
    │   │   └── apiKey.ts     ✅
    │   └── routes.ts         ⬜ empty stub
    └── verification/
        ├── routes.ts         ⬜ empty stub
        └── worker.ts         🔶 skeleton (no real verification)
```

### Target (after all phases complete)
```
backend/src/
├── config.ts
├── index.ts                  ← registers all routes, starts all workers
├── lib/
│   ├── db.ts
│   ├── redis.ts
│   └── queue.ts
└── modules/
    ├── campaigns/
    │   ├── routes.ts
    │   └── service.ts
    ├── enrichment/
    │   ├── providers/
    │   │   ├── base.ts
    │   │   ├── firmographic.ts  (EDGAR + GLEIF + RDAP — free, no key)
    │   │   ├── mailcheck.ts     (NEW — 1,000/mo free, no CC)
    │   │   ├── pdl.ts
    │   │   ├── snov.ts
    │   │   └── tomba.ts
    │   ├── routes.ts
    │   ├── service.ts
    │   └── worker.ts
    ├── llm/
    │   ├── providers/
    │   │   └── openai-compat.ts
    │   ├── router.ts
    │   ├── routes.ts
    │   ├── seed.ts              (NEW — seeds Groq/Gemini/DeepSeek providers into DB)
    │   └── types.ts
    ├── osint/
    │   ├── providers/
    │   │   ├── harvester.ts     (NEW — theHarvester subprocess wrapper)
    │   │   └── serper-maps.ts   (NEW — Serper.dev /maps, ~$0.001/query)
    │   ├── routes.ts            (NEW — /v1/osint/emails, /v1/osint/maps)
    │   └── service.ts           (NEW)
    ├── tenancy/
    │   ├── middleware/
    │   │   └── apiKey.ts
    │   ├── routes.ts            (NEW — workspace CRUD, members, API keys)
    │   └── service.ts           (NEW)
    └── verification/
        ├── providers/
        │   ├── mailcheck.ts     (NEW — Mailcheck.ai primary)
        │   ├── zerobounce.ts    (NEW — ZeroBounce fallback, 100/mo)
        │   └── syntax-mx.ts    (NEW — DNS MX lookup, zero cost)
        ├── routes.ts            (NEW — /v1/verify/email, /v1/verify/batch)
        ├── service.ts           (NEW — 3-stage: syntax → MX → API)
        └── worker.ts            (FILL — wire real service into existing skeleton)
```

---

## 3. Implementation Phases

### Phase A — Wiring (no new features, just connect what exists)
**Estimated time: 30 min. Zero risk of breaking anything.**

1. Register all 4 built route plugins in `index.ts`:
   - `enrichmentRoutes` → prefix `/api`
   - `llmRoutes` → prefix `/api`
   - `campaignRoutes` → prefix `/api`
   - `tenancyRoutes` → prefix `/api` (empty for now, fine)
2. Call `startEnrichmentWorker()` and `startVerificationWorker()` after server starts
3. Add global error handler to `index.ts` (catches uncaught route errors → RFC 7807 shape)

**After Phase A:** `/v1/enrich/person`, `/v1/contacts/search`, `/v1/llm/complete`, all campaign routes, `/v1/llm/providers` are all live.

---

### Phase B — Verification Module
**All free. Mailcheck.ai: 1,000/mo no CC. ZeroBounce: 100/mo no CC. DNS: unlimited.**

Files to create:
- `verification/providers/syntax-mx.ts` — regex + Node `dns.resolve('MX', domain)` (zero cost)
- `verification/providers/mailcheck.ts` — `GET https://api.mailcheck.ai/email/{email}?apiKey=` 
- `verification/providers/zerobounce.ts` — `GET https://api.zerobounce.net/v2/validate?api_key=&email=`
- `verification/service.ts` — 3-stage waterfall: syntax-mx → mailcheck → zerobounce
- `verification/routes.ts` — `POST /v1/verify/email`, `POST /v1/verify/batch`
- Fill `verification/worker.ts` — wire `verifyEmail()` from service

Config keys to add (optional, checked at runtime):
- `MAILCHECK_API_KEY` (already in `config.enrichment.mailcheckApiKey`)
- `ZEROBOUNCE_API_KEY` (already in `config.enrichment.zerobounceApiKey`)

---

### Phase C — Tenancy Routes
**Pure DB operations. No external APIs.**

Files to create:
- `tenancy/service.ts` — workspace CRUD, member management, API key issuance
- `tenancy/routes.ts` — fill the empty stub:
  - `POST /v1/workspaces` — create workspace (org owner only)
  - `GET /v1/workspaces/:id` — get workspace details
  - `GET /v1/workspaces/:id/members` — list members
  - `POST /v1/workspaces/:id/api-keys` — issue API key (returns raw key once, stores hash)
  - `DELETE /v1/workspaces/:id/api-keys/:keyId` — revoke key
  - `GET /v1/workspaces/:id/credits` — credit balance + ledger

---

### Phase D — OSINT Module
**Free tools only. theHarvester: open-source, pip install. Serper.dev: $5 free credit (~5,000 queries).**

Files to create:
- `osint/providers/harvester.ts` — `python3 -m theHarvester -d {domain} -b all -f /tmp/out` subprocess wrapper, parse JSON output
- `osint/providers/serper-maps.ts` — `POST https://google.serper.dev/maps` with `SERPER_API_KEY` env var
- `osint/service.ts` — orchestrate providers, normalize results to Contact shape
- `osint/routes.ts` — fill empty stub:
  - `POST /v1/osint/emails` — discover emails for a domain via theHarvester
  - `POST /v1/osint/maps` — find businesses via Serper.dev Maps (lat/lng + query)

Config keys:
- `SERPER_API_KEY` (new — add to config.ts behind optional check)
- theHarvester needs `pip install theHarvester` in Dockerfile

---

### Phase E — LLM Seed Script
**One-time DB seed for free providers. Must run after Railway deploy.**

Files to create:
- `llm/seed.ts` — `prisma.aiProvider.createMany()` with:

| Provider | Base URL | Free Model | Notes |
|----------|----------|-----------|-------|
| Groq | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | 14,400 req/day free |
| Gemini (via OpenAI compat) | `https://generativelanguage.googleapis.com/v1beta/openai` | `gemini-2.0-flash` | 1,500 req/day free |
| DeepSeek | `https://api.deepseek.com` | `deepseek-chat` | $5 free credit |
| Together AI | `https://api.together.xyz/v1` | `meta-llama/Llama-3.3-70B-Instruct-Turbo` | $25 free credit |

Config keys:
- `GROQ_API_KEY`, `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`, `TOGETHER_API_KEY` — all optional; router skips providers with null key

---

## 4. What This Architecture Does NOT Build (manual-setup or paid)

These belong in `docs/SETUP_REQUIRED.md` and are gated by env var checks:

| Tool | Why deferred |
|------|-------------|
| SMTP verification (Truemail) | Requires VPS — port 25 blocked on Railway/Render/Fly |
| Apify actors | Requires `APIFY_TOKEN` and account setup |
| theHarvester | Requires `pip install` in Docker — Dockerfile change needed |
| NeverBounce / Kickbox | CC required at signup |
| LinkedIn scraping (Crosslinked) | LinkedIn ToS grey area — opt-in only |
| GHunt | Requires active Google session cookies |

---

## 5. API Surface After All Phases

```
GET  /health
GET  /health/redis
GET  /api/v1/status

# Enrichment
POST /api/v1/enrich/person
POST /api/v1/contacts/search

# Verification
POST /api/v1/verify/email
POST /api/v1/verify/batch

# LLM
POST /api/v1/llm/complete
POST /api/v1/llm/providers     (AGENCY_OWNER only)

# Campaigns
POST /api/v1/campaigns
GET  /api/v1/campaigns
GET  /api/v1/campaigns/:id
PATCH /api/v1/campaigns/:id/status
POST /api/v1/campaigns/:id/enroll
POST /api/v1/campaigns/:id/bounce

# Tenancy
POST /api/v1/workspaces
GET  /api/v1/workspaces/:id
GET  /api/v1/workspaces/:id/members
POST /api/v1/workspaces/:id/api-keys
DELETE /api/v1/workspaces/:id/api-keys/:keyId
GET  /api/v1/workspaces/:id/credits

# OSINT
POST /api/v1/osint/emails
POST /api/v1/osint/maps
```

---

## 6. Order of Implementation (Risk-lowest first)

1. **Phase A** — Wire existing routes + workers into index.ts. (30 min, zero new code)
2. **Phase B** — Verification service + routes. (syntax/MX free, Mailcheck.ai + ZeroBounce optional keys)
3. **Phase C** — Tenancy routes. (DB only, no external deps)
4. **Phase D** — OSINT routes. (Serper.dev free credit, theHarvester Dockerfile change)
5. **Phase E** — LLM seed script. (DB seed, run once post-deploy)

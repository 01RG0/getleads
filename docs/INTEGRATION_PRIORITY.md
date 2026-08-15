# Tool Integration Priority Matrix
## Project: LeadScale B2B Platform

> **Created August 2026.** Definitive guide for integration sequencing across all catalogued tools.
> **Scoring formula:** `Priority = Importance × (6 − Difficulty)`
> — rewards high-impact work that's also fast to ship. Max score = 25, min = 1.
>
> **Importance (1–5):** 5 = pipeline blocker / SLA-critical → 1 = niche / low-impact
> **Difficulty (1–5):** 1 = one API key + one HTTP call (<2h) → 5 = self-hosted infra + security review (1–2 weeks)

---

## 1. TL;DR — Top 10 "Do This First"

| Rank | Tool | Category | Imp | Diff | Score | Why First |
|------|------|----------|-----|------|-------|-----------|
| 1 | **Mailcheck.ai** | Email Verification | 5 | 1 | **25** | 1,000 free verifs/month, no CC, endpoints map 1:1 to our 3-stage engine — integrate in <2h, immediately unlocks the SLA guarantee |
| 2 | **ZeroBounce** | Email Verification | 5 | 1 | **25** | Industry standard, no CC, `sub_status`+`catch_all`+`disposable` in one call — parallel primary to Mailcheck |
| 3 | **Snov.io** | Email Discovery | 5 | 1 | **25** | 100 credits/month, no CC, dual-role (Stage 1 search + Stage 2 discovery) — single integration feeds two waterfall stages |
| 4 | **PDL (Person + Company)** | People Search + Firmographic | 5 | 1 | **25** | One API key covers both person lookup AND company firmographic — zero marginal effort for double coverage |
| 5 | **Tomba.io** | Email Discovery | 5 | 1 | **25** | OpenAPI-documented, no CC, domain pattern detection included — cleanest email discovery API to integrate |
| 6 | **SEC EDGAR + GLEIF + OpenCorporates** | Firmographic | 4 | 1 | **20** | Collectively unlimited, zero auth, pure HTTP GET — integrate three government APIs in one afternoon, permanent free coverage |
| 7 | **ScraperAPI** | Proxy | 4 | 1 | **20** | 5,000 free rotating requests/month, no CC, one `api_key` param replaces all proxy config — OSINT fleet unblocked immediately |
| 8 | **Webshare.io** | Proxy | 4 | 1 | **20** | 10 datacenter proxies + 1GB/month free, no CC, standard `user:pass` — drop `PROXY_LIST` env var into containers |
| 9 | **theHarvester** | OSS Email Discovery | 5 | 2 | **20** | `pip install` + subprocess call, 30+ search sources, unlimited — best ROI open-source tool; <1 day to wrap as microservice |
| 10 | **NumVerify** | Phone Validation | 4 | 1 | **20** | 100 lookups/month, no CC, widest-used phone API — adds phone validation to every enriched contact with one key |

---

## 2. Full Priority Matrix

> Sorted by Priority Score (desc). Ties broken by: no-CC > higher free volume > lower duplicate value.

| Rank | Tool | Category | Imp | Diff | Score | Free Tier | Integration Time | Production Risk |
|------|------|----------|-----|------|-------|-----------|-----------------|-----------------|
| 1 | **Mailcheck.ai** | Email Verification | 5 | 1 | 25 | 1,000/mo | <2h — `GET /api/check?email=&apiKey=` | None — no CC, clean API |
| 2 | **ZeroBounce** | Email Verification | 5 | 1 | 25 | 100/mo | <2h — REST POST with JSON body | None — no CC |
| 3 | **Snov.io** | Email Discovery | 5 | 1 | 25 | 100 credits/mo | <2h — OAuth2 token then REST | Low — token refresh needed |
| 4 | **PDL Person API** | People Search | 5 | 1 | 25 | 100–500 req/mo | <2h — single `POST /v5/person/enrich` | Low — verify actual free limit on signup |
| 5 | **PDL Company API** | Firmographic | 5 | 1 | 25 | Same key as PDL Person | 0h extra if PDL Person already done | None — same key |
| 6 | **Tomba.io** | Email Discovery | 5 | 1 | 25 | 50 searches/mo | <2h — `GET /v1/search?domain=&apiKey=` | None |
| 7 | **theHarvester** | OSS Email Discovery | 5 | 2 | 20 | Unlimited (self-hosted) | <1 day — pip install, subprocess wrapper, REST microservice | Medium — needs proxy rotation to avoid rate limits |
| 8 | **Crosslinked** | OSS Email Permutation | 5 | 2 | 20 | Unlimited (self-hosted) | <1 day — pip install, CLI wrapper generating email candidates | Low — no external API calls |
| 9 | **NeverBounce** | Email Verification | 4 | 1 | 20 | 1,000/mo | <2h — REST POST `/v4/single/check` | **CC required on signup** |
| 10 | **MillionVerifier** | Email Verification | 4 | 1 | 20 | 100/mo | <2h — REST GET with `apikey` param | None |
| 11 | **AbstractAPI Email** | Email Verification | 4 | 1 | 20 | 100/mo | <2h — same AbstractAPI account as phone | None — shared account |
| 12 | **Skrapp.io** | Email Discovery | 4 | 1 | 20 | 100 credits/mo | <2h — REST POST | None |
| 13 | **GetProspect** | Email Discovery | 4 | 1 | 20 | 50 credits/mo | <2h — REST API with `apiKey` header | None |
| 14 | **Voila Norbert** | Email Discovery | 4 | 1 | 20 | 50 searches/mo | <2h — REST POST `/v2/prospects` | None |
| 15 | **Fullcontact** | People Search | 4 | 1 | 20 | 100/mo | <2h — REST POST `/v3/person.enrich` | None |
| 16 | **Datagma** | People Search | 4 | 1 | 20 | 100/mo | <2h — REST GET | None — good EU coverage |
| 17 | **Clearbit / HubSpot Enrichment** | People Search | 4 | 1 | 20 | 100/mo | <2h — REST GET | None — later useful for HubSpot sync path |
| 18 | **NumVerify** | Phone Validation | 4 | 1 | 20 | 100/mo | <2h — REST GET `?number=&access_key=` | None |
| 19 | **AbstractAPI Phone** | Phone Validation | 4 | 1 | 20 | 100/mo | <2h — same account as AbstractAPI Email | None — shared account |
| 20 | **SEC EDGAR API** | Firmographic | 4 | 1 | 20 | Unlimited | <2h — no auth, plain HTTP GET | None — government API |
| 21 | **Companies House UK API** | Firmographic | 4 | 1 | 20 | 600 req/5min | <2h — free API key, REST GET | None — UK companies only |
| 22 | **GLEIF LEI API** | Firmographic | 4 | 1 | 20 | Unlimited | <2h — no auth, REST GET | None |
| 23 | **OpenCorporates API** | Firmographic | 4 | 1 | 20 | 500 req/day | <2h — API key, REST GET | None — 140+ jurisdictions |
| 24 | **WHOIS / RDAP** | Firmographic | 4 | 1 | 20 | Free | <2h — no auth, multiple public providers | None — domain first-pass only |
| 25 | **ScraperAPI** | Proxy | 4 | 1 | 20 | 5,000 req/mo | <2h — add `?api_key=` param to any request | None |
| 26 | **Webshare.io** | Proxy | 4 | 1 | 20 | 10 proxies / 1GB | <2h — add `PROXY_LIST` env var to containers | None |
| 27 | **Geonode** | Proxy | 4 | 1 | 20 | 1GB/mo residential | <2h — fetch proxy list, pass as `HTTPS_PROXY` | None |
| 28 | **Voyage AI** | AI — Embeddings | 4 | 1 | 20 | 10K req/mo | <2h — REST POST, no OpenAI wrapper needed | None — fills embedding gap |
| 29 | **holehe** | OSS Email OSINT | 4 | 2 | 16 | Unlimited (self-hosted) | <1 day — pip install + FastAPI wrapper (GPL container) | Low — GPL isolation required |
| 30 | **Reoon Email Verifier** | Email Verification | 3 | 1 | 15 | 100/mo | <2h | None |
| 31 | **EmailListVerify** | Email Verification | 3 | 1 | 15 | 100/mo | <2h | None |
| 32 | **Debounce.io** | Email Verification | 3 | 1 | 15 | 100/mo | <2h — CSV batch option useful for background workers | None |
| 33 | **QuickEmailVerification** | Email Verification | 3 | 1 | 15 | 100/mo | <2h | None |
| 34 | **Kickbox** | Email Verification | 3 | 1 | 15 | 100/mo | <2h — strong spam trap detection | **CC required** |
| 35 | **ContactOut** | Email Discovery | 3 | 1 | 15 | 50 searches/mo | <2h | None — dual email+phone value |
| 36 | **Leadjet** | People Search | 3 | 1 | 15 | 100/mo | <2h | None — useful for HubSpot/Salesforce path |
| 37 | **Kaspr** | People Search | 3 | 1 | 15 | 50 credits/mo | <2h | None |
| 38 | **Veriphone** | Phone Validation | 3 | 1 | 15 | 100/mo | <2h | None |
| 39 | **D7 Networks** | Phone Validation | 3 | 1 | 15 | 100/mo | <2h — mobile vs VoIP differentiation | None |
| 40 | **Byteplant** | Phone Validation | 3 | 1 | 15 | 100/mo | <2h — CNAM lookup for US | None |
| 41 | **BuiltWith API** | Technographic | 3 | 1 | 15 | ~1,000 req/mo | <2h — API key, REST GET | Low — verify free tier on signup |
| 42 | **Harmonic.ai** | Firmographic | 3 | 1 | 15 | ~500 req/mo | <2h | None — startup coverage |
| 43 | **ScrapingBee** | Proxy | 3 | 1 | 15 | 1,000 req/mo | <2h — single endpoint, JS rendering | None |
| 44 | **Zenrows** | Proxy | 3 | 1 | 15 | 1,000 req/mo | <2h — anti-bot built-in | None |
| 45 | **Crawlbase** | Proxy | 3 | 1 | 15 | 1,000 req/mo | <2h | None |
| 46 | **IPRoyal** | Proxy | 3 | 1 | 15 | 500MB/mo | <2h — standard `user:pass` | None |
| 47 | **PROXY-List (TheSpeedX)** | Proxy (OSS) | 3 | 1 | 15 | Unlimited (GitHub auto-updated) | <2h — curl the raw list on container start | Low — public proxies unreliable for prod |
| 48 | **Together AI** | AI — Inference | 3 | 1 | 15 | $25 credit | <2h — OpenAI-compatible, drop-in | None |
| 49 | **Fireworks AI** | AI — Inference | 3 | 1 | 15 | $10 credit | <2h — function calling, OpenAI-compatible | None |
| 50 | **Perplexity API** | AI — Web Search | 3 | 1 | 15 | 5K req/day | <2h — web-grounded, intent signal use case | None |
| 51 | **AnyMail Finder** | Email Discovery | 3 | 1 | 15 | 10 searches/mo | <2h | **Low volume — premium fallback only** |
| 52 | **LeadMagic** | Email Discovery | 3 | 1 | 15 | 25 credits/mo | <2h | Low volume |
| 53 | **crawl4ai** | OSS Web Scraping | 5 | 3 | 15 | Unlimited (self-hosted) | 1–3 days — Docker, Playwright, schema config | Medium — Playwright anti-bot config needed |
| 54 | **Truemail (OSS)** | OSS Email Verification | 5 | 3 | 15 | Unlimited (self-hosted) | 1–3 days — Ruby gem + FastAPI/Rack REST wrapper | Low — MIT license, clean integration |
| 55 | **WhatWeb** | OSS Technographic | 3 | 2 | 12 | Unlimited (self-hosted) | <1 day — Ruby CLI, Docker image, JSON output | None |
| 56 | **mosint** | OSS Email OSINT | 3 | 2 | 12 | Unlimited (self-hosted) | <1 day — Go binary, simple subprocess call | None |
| 57 | **phoneinfoga** | OSS Phone OSINT | 3 | 2 | 12 | Unlimited (self-hosted) | <1 day — binary + REST API, Docker available | Low — Google Dorking may hit rate limits |
| 58 | **apify/gmap-scraper** | OSS Lead Discovery | 3 | 2 | 12 | Unlimited (self-hosted via Apify Actor) | <1 day — Apify Actor SDK | Low — Google Maps ToS: personal/business info only |
| 59 | **Wappalyzer (OSS)** | OSS Technographic | 4 | 3 | 12 | Unlimited (self-hosted) | 1–3 days — Node.js + Docker + GPL container isolation | Medium — GPL isolation required |
| 60 | **Telnyx Lookup** | Phone Validation | 3 | 2 | 12 | 100/mo (trial) | <1 day — Bearer token auth | **CC required, trial only** |
| 61 | **Twilio Lookup** | Phone Validation | 3 | 2 | 12 | Trial credits only | <1 day — BasicAuth (SID + Token) | **CC required — pay-per-use after trial** |
| 62 | **GHunt** | OSS Email OSINT | 3 | 3 | 9 | Unlimited (self-hosted) | 1–3 days — Google auth cookie refresh setup | High — requires active Google session maintenance |
| 63 | **Scrapling** | OSS Web Scraping | 3 | 3 | 9 | Unlimited (self-hosted) | 1–3 days — Python, anti-bot config | Medium — fallback scraper, overlaps crawl4ai |
| 64 | **browser-use** | OSS Web Automation | 3 | 3 | 9 | Unlimited (self-hosted) | 1–3 days — requires LLM API key + Playwright | Medium — AI-agent web automation, higher resource cost |
| 65 | **proxybroker2** | Proxy (OSS) | 3 | 3 | 9 | Unlimited (public proxies) | 1–3 days — Python Docker sidecar, validation pipeline | High — public proxies unreliable for production SLA |
| 66 | **goproxy** | Proxy (OSS) | 3 | 3 | 9 | Unlimited (self-hosted relay) | 1–3 days — Go build + Docker image + TLS config | Medium — useful as fleet gateway, not as proxy source |
| 67 | **Hugging Face Inference** | AI — Inference | 2 | 2 | 8 | 10K req/mo | <1 day — REST, but model selection complexity | Low — for custom fine-tuned models only |
| 68 | **Surfe** | People Search | 2 | 2 | 8 | 50 credits/mo | <1 day — OAuth required | Low — primarily browser extension, limited headless API |
| 69 | **Apify Proxy** | Proxy | 2 | 2 | 8 | ~$1/GB pay-as-you-go | <1 day | **CC required** |
| 70 | **Crunchbase Basic** | Firmographic | 2 | 2 | 8 | 100 req/mo | <1 day — OAuth 2.0 | **CC required — too limited for meaningful use** |
| 71 | **Zhipu ChatGLM** | AI — APAC | 2 | 2 | 8 | 1M tokens/mo (new user) | <1 day — OpenAI-compatible | Medium — requires Chinese account/phone |
| 72 | **AI21 Labs** | AI — Inference | 2 | 1 | 10 | 10K tokens/mo | <2h — OpenAI-compatible | Low — very low quota |
| 73 | **Lepton AI** | AI — Custom Models | 2 | 1 | 10 | 5K req/mo | <2h | None — custom model hosting |
| 74 | **sherlock** | OSS Identity | 2 | 2 | 8 | Unlimited (self-hosted) | <1 day — Python CLI | Low — username search, low direct B2B value |
| 75 | **Overloop** | Email Discovery | 2 | 1 | 10 | 25 credits/mo | <2h | Low volume — 25 credits barely useful |
| 76 | **Verifalia** | Email Verification | 2 | 1 | 10 | 25 verif/mo | <2h | Low volume — VIP contacts only |
| 77 | **Moonshot Kimi** | AI — APAC | 1 | 2 | 4 | 50K tokens/mo | <1 day | Medium — APAC-specific account |
| 78 | **01.ai / Yi** | AI — APAC | 1 | 2 | 4 | Limited | <1 day | Medium — APAC-specific |
| 79 | **Anyscale / Lepton** | AI — Inference | 1 | 2 | 4 | Limited | <1 day | Low — largely superseded by Together/Fireworks |
| 80 | **maigret** | OSS Identity | 2 | 3 | 6 | Unlimited (self-hosted) | 1–3 days — Python, 3000+ site check | Low — overkill for B2B pipeline |
| 81 | **SOAX** | Proxy | 2 | 2 | 8 | 7-day trial / 5GB | <1 day | **CC required — trial only, no permanent free tier** |
| 82 | **spiderfoot** | OSS OSINT Framework | 2 | 4 | 4 | Unlimited (self-hosted) | 3–7 days — full OSINT platform setup | High — overkill for B2B; 200+ modules = complex config |

---

## 3. Phase Plan

### Phase 0 — MVP Core (Week 1–2)
**Goal:** Platform can verify emails and search contacts. SLA guarantee unlocked.
All tools here are Difficulty ≤ 1 and Importance = 4–5. Total integration time: ~2 working days.

| Tool | Time | What It Unlocks |
|------|------|-----------------|
| Mailcheck.ai | 2h | Primary email verifier — 3-stage engine live |
| ZeroBounce | 2h | Verification redundancy — SLA guarantee defensible |
| Snov.io | 2h | Email discovery Stage 1 + 2 live |
| Tomba.io | 2h | Email discovery secondary |
| PDL Person + Company API | 2h | People search + firmographic in one key |
| SEC EDGAR + GLEIF + OpenCorporates | 2h | Unlimited company registry — zero cost |
| NumVerify + AbstractAPI Phone | 2h | Phone validation live |
| ScraperAPI + Webshare.io | 2h | OSINT worker fleet can run without IP throttling |

---

### Phase 1 — Waterfall Depth (Week 3–4)
**Goal:** Full waterfall with redundant providers at every stage. No single point of failure.

| Tool | Time | What It Adds |
|------|------|-------------|
| theHarvester (OSS) | 1 day | Unlimited email discovery from 30+ sources |
| Crosslinked (OSS) | 1 day | Email permutation generation from LinkedIn names |
| holehe (OSS) | 1 day | Zero-cost email social-presence verification (GPL container) |
| Fullcontact + Datagma + Clearbit | 1 day | People search waterfall redundancy |
| MillionVerifier + AbstractAPI Email | 1 day | Verification fallback stack built out |
| GetProspect + Voila Norbert + Skrapp | 1 day | Email discovery waterfall filled out |
| WHOIS/RDAP + Companies House UK | 2h | Domain + UK company validation |
| Voyage AI | 2h | Embeddings layer live — deduplication unlocked |

---

### Phase 2 — Coverage Expansion (Week 5–8)
**Goal:** Technographic data, phone depth, remaining discovery APIs, AI layer extended.

| Tool | Time | What It Adds |
|------|------|-------------|
| crawl4ai (OSS) | 2 days | AI-native company website scraping |
| Wappalyzer (OSS) | 2 days | Tech stack detection per company domain |
| WhatWeb (OSS) | 1 day | Technographic fallback for crawl4ai |
| mosint + phoneinfoga (OSS) | 1 day | Phone OSINT + email OSINT depth |
| BuiltWith API | 2h | 100K+ tech signatures, no OSS alternative at this coverage |
| Harmonic.ai | 2h | Startup/growth-stage company signals |
| ContactOut | 2h | Phone + email combined discovery |
| Together AI + Fireworks AI | 2h | AI gateway extended — function calling unlocked |
| Perplexity API | 2h | Web-grounded intent signal detection live |
| Geonode + IPRoyal | 2h | Residential proxy fallback for OSINT fleet |
| Debounce.io + Reoon + QuickEmailVerification | 1 day | Final verification fallback stack complete |

---

### Phase 3 — Self-Hosted Infrastructure (Week 9–12)
**Goal:** Eliminate API costs at scale with Docker worker fleet.

| Tool | Time | What It Adds |
|------|------|-------------|
| Truemail (OSS) | 2 days | Unlimited batch email verification — eliminates verification API costs |
| Scrapling (OSS) | 2 days | Anti-bot scraping fallback worker |
| browser-use (OSS) | 3 days | AI-agent web automation for complex directory forms |
| proxybroker2 + goproxy (OSS) | 3 days | Self-hosted proxy rotation fleet — zero proxy cost fallback |
| GHunt (OSS) | 2 days | Gmail/Google account enrichment (requires Google session management) |
| apify/gmap-scraper | 1 day | Google Maps SMB lead ingestion worker |

---

### Phase 4 — AI Layer & Specialist Integrations (Month 4+)
**Goal:** Embeddings, APAC pipeline, custom model hosting, advanced identity resolution.

| Tool | Time | What It Adds |
|------|------|-------------|
| Hugging Face Inference API | 1 day | Custom fine-tuned enrichment model deployment |
| Zhipu ChatGLM | 1 day | APAC/Chinese-language pipeline routing |
| Lepton AI / AI21 Labs | 1 day | Specialist model tiers for AI gateway |
| maigret (OSS) | 3 days | Deep identity resolution (post-MVP enrichment) |
| sherlock (OSS) | 1 day | Username-to-profile correlation |
| Crunchbase Basic | 1 day | VC-backed startup funding data (OAuth, CC required) |
| Telnyx / Twilio Lookup | 1 day | Premium CNAM lookup for high-value contacts |

---

## 4. Risk Flags

### Hard CC Traps (no real free tier without a card on file)
| Tool | Risk | Mitigation |
|------|------|-----------|
| **NeverBounce** | CC required at signup despite 1,000/mo free | Use Mailcheck.ai as primary — identical volume, no CC |
| **Kickbox** | CC required | Use as Phase 2 add-on only — strong spam trap detection worth adding later |
| **Twilio Lookup** | CC required + pay-per-lookup after trial | Reserve for VIP contacts only; set hard per-request budget cap |
| **Telnyx** | CC required, trial-only | Same constraint as Twilio |
| **Crunchbase Basic** | CC required + OAuth | Very limited (100/mo) — integrate only when VC startup vertical is live |
| **SOAX** | CC required, no permanent free tier | Exclude from waterfall stack — 7-day trial only |
| **Apify Proxy** | CC required, pay-as-you-go | Use ScraperAPI/Webshare first; Apify only if specific Actor integration needed |

### Hard Volume Caps (will break in production)
| Tool | Cap | Risk |
|------|-----|------|
| **AnyMail Finder** | 10 searches/month | Only 10 — will exhaust on day 1 of beta; add to waterfall as final accuracy fallback only |
| **Overloop** | 25 credits/month | Will exhaust within hours of light usage — placeholder only |
| **LeadMagic** | 25 credits/month | Same — placeholder |
| **Verifalia** | 25 verifications/month | VIP-only use case |
| **PDL free tier** | "100–500 credits/month" inconsistency noted | Verify exact limit on signup before building waterfall logic around specific number |

### ToS / Legal Concerns
| Tool | Concern |
|------|---------|
| **Crosslinked** | LinkedIn scraping — LinkedIn ToS prohibits automated enumeration. Container must rate-limit aggressively and rotate IPs. Legal for security research; grey area for commercial use. Add explicit consent layer or pivot to domain-only mode. |
| **holehe** | Uses password-reset endpoints to check email registration — not against platforms' ToS directly, but platforms may block/detect over time. GPL isolation required. |
| **sherlock / maigret** | Username enumeration at scale — use only for optional deep enrichment on explicit user request, not as automatic pipeline stage. |
| **GHunt** | Requires an active Google account session (cookies) — violates Google ToS if automated. Only use on explicit opt-in enrichment, not background pipeline. |
| **apify/gmap-scraper** | Google Maps Terms prohibit scraping at scale for commercial redistribution. Use for bootstrapping internal DB only, not as live production pipeline. |

### [VERIFY] Unconfirmed Repos (from research agent — validate before integrating)
| Tool | Status |
|------|--------|
| **avrabyt/yelp-scraper** | Star count unconfirmed — check GitHub before adding to OSS catalog |
| **jadolint/email-permutator** | Stars and activity unconfirmed — validate; use Crosslinked instead if dead |

### Chinese AI Providers
All Chinese AI providers (Zhipu, Moonshot, ByteDance Doubao, Alibaba DashScope, Baidu ERNIE) require a non-US/non-CN phone number for account registration. Factor this into key provisioning workflow — cannot automate account creation.

---

## 5. Easy Wins — Integrate on Day 1

These 5 tools are **Importance ≥ 4** AND **Difficulty = 1** AND **no CC required**. Each takes under 2 hours. Together they unlock the full core pipeline in a single day.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DAY 1 INTEGRATION CHECKLIST                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ☐ 1. MAILCHECK.AI          — 1,000 email verifs/month, no CC      │
│       GET /api/check?email=&apiKey=                                 │
│       → Stage 3 verification engine: PRIMARY                        │
│                                                                     │
│  ☐ 2. SNOV.IO               — 100 discovery credits/month, no CC   │
│       POST /v2/domain-search                                        │
│       → Stage 1 + Stage 2 waterfall: PRIMARY                       │
│                                                                     │
│  ☐ 3. PDL (PEOPLE DATA LABS) — 100–500 req/month, one key          │
│       POST /v5/person/enrich  +  POST /v5/company/enrich            │
│       → Stage 1 people search + Stage 5 firmographic: both stages  │
│                                                                     │
│  ☐ 4. SCRAPERAPI            — 5,000 proxy req/month, no CC         │
│       Wrap any OSINT request: GET https://api.scraperapi.com/?...   │
│       → OSINT worker fleet: UNBLOCKED                              │
│                                                                     │
│  ☐ 5. SEC EDGAR + GLEIF + OPENCORPORATES  — unlimited, zero auth   │
│       Plain HTTP GET to 3 government APIs                           │
│       → Company validation: ALWAYS-ON, zero cost forever           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Time estimate:** ~8 hours total for all 5. After Day 1: email discovery, verification, people search, company registry, and proxy rotation are all live with zero ongoing API cost.

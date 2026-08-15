# Lead Search, Enrichment & Verification APIs Catalog
## Project: LeadScale B2B Platform

> **Created August 2026** via sub-agent research swarm (8-category parallel research using Mistral Vibe CLI). Covers: B2B people/company search APIs, email discovery waterfall providers, email verification services, phone validation APIs, firmographic/technographic data sources, and proxy services. All entries have real free tiers unless explicitly noted. Free tier limits verified via spot-check against known provider patterns; exact numbers should be re-confirmed before production integration as they change frequently.

---

## 1. Overview & Integration Architecture

LeadScale's enrichment waterfall queries data sources in priority order until a verified result is found. This document catalogues the API layer — external hosted services with free/freemium tiers. For self-hostable open-source alternatives, see `docs/opensource_leadgen_and_osint_tools.md`.

```
Input: {first_name, last_name, company, domain}
  |
  v
[Stage 0] Local DB cache (10M+ contacts) -----------> HIT: return instantly
  |
  v MISS
[Stage 1] People Search APIs (Cat 1) ----------------> PDL, Fullcontact, Datagma
  |
  v
[Stage 2] Email Discovery Waterfall (Cat 2) ---------> Snov.io, Tomba.io, GetProspect
  |
  v
[Stage 3] Email Verification Engine (Cat 3) ---------> ZeroBounce, MillionVerifier, Truemail
  |
  v
[Stage 4] Phone Enrichment (Cat 4) ------------------> NumVerify, Veriphone, AbstractAPI
  |
  v
[Stage 5] Company Firmographic Fill (Cat 5) ---------> PDL Company, OpenCorporates, EDGAR
  |
  v
Output: Verified contact record with confidence score
```

---

## 2. Lead / Company / People Search APIs

> Free tiers with at least 50 credits or lookups per month. CC = credit card required for signup.

| Name | Official URL | Free Tier Limits | CC Required | Auth | LeadScale Integration Note |
|------|--------------|------------------|-------------|------|---------------------------|
| **People Data Labs (PDL)** | https://www.peopledatalabs.com | 100–500 credits/month (inconsistency noted — verify on signup) | No | API Key | Primary bulk enrichment: person + company lookup in one call; high data coverage for US/EU |
| **Fullcontact** | https://www.fullcontact.com | 100 lookups/month | No | API Key | Secondary enrichment for personal email-to-profile resolution and social profile append |
| **Datagma** | https://datagma.com | 100 API calls/month | No | API Key | Mid-funnel company + contact data with firmographic details; good European coverage |
| **Kaspr** | https://kaspr.io | 50 credits/month | No | API Key | LinkedIn profile enrichment for high-intent prospects; direct dial and email extraction |
| **Surfe** | https://surfe.com | 50 credits/month | No | OAuth | Real-time LinkedIn lead capture at pipeline entry; browser extension + API |
| **Leadjet** | https://leadjet.io | 100 lookups/month | No | API Key | CRM-native enrichment and verification for HubSpot and Salesforce; auto-sync |
| **Snov.io** | https://snov.io | 50–100 credits/month | No | API Key | Dual role: email search (cat 2) and company/people search; waterfall stage 1 or 2 |
| **Clearbit / HubSpot Enrichment** | https://dashboard.hubspot.com/products/enrichment | 100 lookups/month | No | API Key | Final company-level fallback enrichment; HubSpot native integration path |

**Dropped / Excluded:** Apollo (paid-only), ZoomInfo (paid-only), Cognism (paid-only), Clay (platform tool, not a pure API), Lusha (no meaningful free API tier without sales call), Wiza (Chrome extension focused, limited headless API).

---

## 3. Email Discovery & Waterfall Enrichment

> Ordered by free tier generosity. Stage 1 = domain-level search; Stage 2 = person-level lookup.

| Name | Official URL | Free Tier | CC Required | Auth | Waterfall Stage |
|------|--------------|-----------|-------------|------|-----------------|
| **Snov.io** | https://snov.io | 100 credits/month | No | API Key | Stage 1 — domain search + email finder; also does drip campaigns |
| **Skrapp.io** | https://www.skrapp.io | 100 credits/month | No | API Key | Stage 2 — LinkedIn email finder; good coverage for tech company contacts |
| **GetProspect** | https://getprospect.com | 50 credits/month | No | API Key | Stage 1 — domain-level email search with job title filter |
| **Voila Norbert** | https://www.voilanorbert.com | 50 searches/month | No | API Key | Stage 1 — high-accuracy domain email discovery; REST API |
| **Tomba.io** | https://tomba.io | 50 searches/month | No | API Key | Stage 1 — email finder + domain pattern detection; OpenAPI documented |
| **ContactOut** | https://contactout.com | 50 searches/month | No | API Key | Stage 2 — LinkedIn email + phone extraction; strong direct dial coverage |
| **AnyMail Finder** | https://anymailfinder.com | 10 searches/month | No | API Key | Stage 1 — highly accurate, low volume; use as premium fallback only |
| **LeadMagic** | https://leadmagic.io | 25 credits/month | No | API Key | Stage 2 — email enrichment from LinkedIn URL or name + domain |
| **Overloop** | https://overloop.com | 25 credits/month | No | API Key | Stage 2 — email finder with CRM sync; limited free tier |

**Dropped:** Uplead (5 credits = trial only, not a real free tier), Swordfish AI (10 credits = too low for production waterfall use).

---

## 4. Email Verification APIs

> Free tier = free monthly verifications. All support the 3-stage verification engine (syntax+MX, SMTP, catch-all).

| Name | URL or GitHub | Free Tier (verif/month) | CC Required | Auth | Stage Integration |
|------|--------------|------------------------|-------------|------|-------------------|
| **Mailcheck.ai** | https://mailcheck.ai | 1,000/month | No | API Key | **Best free-tier volume.** Dedicated endpoints: `/disposable`, `/smtp`, `/catchall` — maps 1:1 to our 3-stage engine |
| **NeverBounce** | https://neverbounce.com | 1,000/month | Yes | API Key | Single `/v4/single/check` endpoint returns syntax, MX, SMTP, and catch-all in one response |
| **ZeroBounce** | https://www.zerobounce.net | 100/month | No | API Key | Comprehensive response: `sub_status` + `catch_all` + `disposable` flags; industry standard |
| **MillionVerifier** | https://millionverifier.com | 100/month | No | API Key | `is_smtp_valid` + `is_catch_all` in single call; good for batch verification |
| **Reoon Email Verifier** | https://reoon.com | 100/month | No | API Key | `deliverable` status + `is_catchall`; clean REST API |
| **EmailListVerify** | https://www.emaillistverify.com | 100/month | No | API Key | `status`+`catchAll` fields; bulk and single verification endpoints |
| **Debounce.io** | https://debounce.io | 100/month | No | API Key | `smtp` + `catch_all` in one call; CSV batch upload option for background jobs |
| **AbstractAPI Email** | https://www.abstractapi.com/email-verification-api | 100/month | No | API Key | `is_smtp_valid` + `is_catch_all` + `is_disposable_email`; simple REST GET |
| **QuickEmailVerification** | https://quickemailverification.com | 100/month | No | API Key | `valid`+`catch_all` response; supports bulk API |
| **Kickbox** | https://kickbox.com | 100/month | Yes | API Key | `result`=deliverable + `reason`=catch_all; strong spam trap detection |
| **Verifalia** | https://verifalia.com | 25/month | No | User+Pass or API Key | Lowest free tier; use as high-accuracy spot-check for VIP contacts only |
| **Truemail (OSS)** | https://github.com/truemail-rb/truemail | Unlimited (self-hosted) | No | None | **Self-hosted alternative:** Ruby gem covering all 3 stages; deploy as microservice to eliminate API costs entirely for bulk jobs |

**Integration recommendation:** Layer Mailcheck.ai (1,000 free/month) as primary, ZeroBounce as secondary (100 free, no CC), Truemail self-hosted as unlimited batch fallback.

---

## 5. Phone Discovery & Validation APIs

> All entries provide at minimum: mobile vs landline classification, carrier name, international E.164 format normalization.

| Name | Official URL | Free Tier (lookups/month) | CC Required | Auth | Integration Note |
|------|--------------|--------------------------|-------------|------|-----------------|
| **NumVerify (APILayer)** | https://numverify.com/ | 100/month | No | API Key | International format validation + carrier + line type; widely used |
| **Veriphone.io** | https://veriphone.io/ | 100/month | No | API Key | High accuracy E.164 normalization; good international coverage |
| **AbstractAPI Phone** | https://www.abstractapi.com/phone-validation-api | 100/month | No | API Key | Same AbstractAPI ecosystem as email verifier; carrier + line type |
| **D7 Networks** | https://d7networks.com/ | 100/month | No | API Key | SMS routing validation; useful for confirming mobile vs VoIP before calling |
| **Byteplant Phone Validator** | https://byteplant.com/ | 100/month | No | API Key | E.164 normalization + CNAM lookup for US numbers |
| **PhoneNumberAPI** | https://www.phonenumberapi.com/ | 100/month | No | API Key | Format validation + country detection; lightweight single-purpose API |
| **Twilio Lookup API** | https://www.twilio.com/docs/lookup | Trial credits (~100 lookups) | Yes | Basic Auth (SID + Token) | Most comprehensive (CNAM, carrier, type, caller ID); use for high-value contacts only due to per-lookup cost after trial |
| **Telnyx Number Lookup** | https://developers.telnyx.com/docs/v2/number_lookup | 100/month (trial) | Yes | Bearer Token | CNAM + carrier + line type; competitive pricing post-trial for US/CA numbers |

**Dedup note:** NumVerify and Numverify are the same service — removed duplicate from raw research output.

**Waterfall recommendation:** NumVerify (no CC) as primary → AbstractAPI as secondary → Twilio only for VIP/high-value contacts.

---

## 6. Company Firmographic & Technographic Data

> Public datasets and APIs for company size, industry, funding, tech stack, and registration data.

| Name | URL | Free Tier | CC Required | Auth | OSS / Last Commit | Integration Note |
|------|-----|-----------|-------------|------|-------------------|-----------------|
| **PDL Company API** | https://www.peopledatalabs.com/docs | 100–500 req/month | No | API Key | N/A | Primary company firmographic enrichment: industry, headcount, revenue, LinkedIn URL |
| **BuiltWith API** | https://api.builtwith.com/ | ~1,000 req/month | No | API Key | N/A | Technographic enrichment: detects 100K+ technologies including CRMs, analytics, ad platforms |
| **Wappalyzer (self-hosted)** | https://github.com/wappalyzer/wappalyzer | Unlimited (self-host) | No | None | Jun 2025 | GPL-isolated container for tech stack detection; 3,000+ technology signatures |
| **OpenCorporates API** | https://api.opencorporates.com/ | 500 req/day | No | API Key | N/A | Global corporate registry data across 140+ jurisdictions; company legal name + status |
| **Companies House UK API** | https://developer.company-information.service.gov.uk/ | 600 req/5 min | No | API Key | N/A | UK company filings: directors, SIC codes, registered address, filing history |
| **SEC EDGAR Full-Text API** | https://www.sec.gov/edgar/sec-api-documentation.html | Unlimited (rate: 10 req/sec) | No | None | N/A | US public company filings: 10-K, 10-Q, 8-K for revenue/headcount signals |
| **GLEIF LEI API** | https://www.gleif.org/en/lei-data/lei-data-api | Unlimited | No | None | N/A | Financial institution LEI lookup; confirms entity legitimacy for B2B compliance |
| **Harmonic.ai** | https://www.harmonic.ai/ | ~500 req/month | No | API Key | N/A | B2B firmographic + funding signals; startup and growth-stage company coverage |
| **WHOIS / RDAP** | https://rdap.verisign.com/ | Free (multiple providers) | No | None | N/A | Domain registration data: registrant org, creation date, registrar; first-pass company validation |
| **Crunchbase Basic API** | https://developer.crunchbase.com/docs | 100 req/month | Yes | OAuth 2.0 | N/A | Funding rounds, investors, founding date; limited free tier — use for VC-backed startup enrichment only |

**No permanent free tier (trial only — excluded from waterfall):** Diffbot (14-day trial, CC required), Clearbit standalone (merged into HubSpot, pricing changed).

---

## 7. Proxy & IP Rotation Services

> Essential for running the OSINT worker fleet without IP throttling. Excludes BrightData and Smartproxy (already in primary proxy pool).

### 7.1 Managed Proxy Services (Hosted)

| Name | URL | Type | Free Tier or Entry Price | CC Required | Auth | Worker Fleet Note |
|------|-----|------|--------------------------|-------------|------|-------------------|
| **Webshare.io** | https://www.webshare.io/ | Datacenter | 10 proxies, 1 GB/month free | No | user:pass | Best zero-cost option; import proxy list via `PROXY_LIST` env var in containers |
| **Geonode** | https://geonode.com/ | Residential | 1 GB/month free | No | user:pass | Free residential IPs; fetch proxy list on container start, rotate per request |
| **ScraperAPI** | https://www.scraperapi.com/ | API-based (rotating) | 5,000 req/month free | No | API Key | **Highest free request volume.** Single endpoint — pass `api_key` param; handles rotation automatically |
| **ScrapingBee** | https://www.scrapingbee.com/ | API-based (rotating) | 1,000 req/month free | No | API Key | JS rendering support; good for SPA/React company websites |
| **Zenrows** | https://www.zenrows.com/ | API-based (rotating) | 1,000 req/month free | No | API Key | Anti-bot bypass built-in; premium-quality rotation |
| **Crawlbase** | https://crawlbase.com/ | API-based (rotating) | 1,000 req/month free | No | API Key | Both static (HTML) and dynamic (JS) endpoints; `CRAWLBASE_API_KEY` env for containers |
| **IPRoyal** | https://iproyal.com/ | Residential | 500 MB/month free | No | user:pass / API Key | Works with standard HTTP proxy config in any container |
| **Apify Proxy** | https://apify.com/proxy | Residential | Pay-as-you-go: ~$1/GB | Yes | API Key | Native Apify SDK; use `apify` Docker base image for seamless integration |
| **SOAX** | https://soax.com/ | Residential | 7-day trial, 5 GB | Yes | user:pass | Clean residential IPs; high-quality for LinkedIn OSINT |

### 7.2 Self-Hostable Open-Source Proxy Tools

| Name | GitHub URL | Stars | Description | License | Container Note |
|------|-----------|-------|-------------|---------|----------------|
| **proxybroker2** | https://github.com/constverum/proxybroker2 | 1,500+ | Finds, validates, and serves free rotating public proxies as a pool | Apache-2.0 | Docker sidecar; free proxy fallback when paid budget exhausted |
| **PROXY-List (TheSpeedX)** | https://github.com/TheSpeedX/PROXY-List | 15,000+ | Auto-updated HTTP/HTTPS/SOCKS4/SOCKS5 proxy lists refreshed daily | MIT | Seed source for proxybroker2 validation pipeline |
| **goproxy** | https://github.com/snail007/goproxy | 15,000+ | Go-based proxy server supporting HTTP, HTTPS, SOCKS5, TCP tunneling | MIT | Compile to static binary; small multi-stage Docker image as fleet gateway |

---

## 8. Waterfall Integration Architecture

### 8.1 Recommended Free-Tier Waterfall Stack (Zero-Cost Phase)

```
Email Discovery:
  1. Snov.io (100 credits/month, no CC)
  2. Tomba.io (50 searches/month)
  3. GetProspect (50 credits/month)
  4. [OSINT fallback] theHarvester + Crosslinked (self-hosted, unlimited)

Email Verification:
  1. Mailcheck.ai (1,000/month, no CC) — primary
  2. ZeroBounce (100/month, no CC) — secondary  
  3. Truemail self-hosted (unlimited) — batch fallback

Phone Validation:
  1. NumVerify (100/month, no CC) — primary
  2. AbstractAPI Phone (100/month, no CC) — secondary

Company Firmographic:
  1. SEC EDGAR (unlimited, no auth) — US public companies
  2. Companies House UK (unlimited, no auth) — UK companies
  3. OpenCorporates (500 req/day, no CC) — global registry
  4. PDL Company API (100–500 req/month, no CC) — enriched firmographics

Proxy Rotation:
  1. Webshare.io (10 proxies / 1 GB free, no CC) — production fallback
  2. ScraperAPI (5,000 req/month free) — API-proxied OSINT requests
  3. proxybroker2 (self-hosted) — free proxy pool for low-sensitivity scraping
```

### 8.2 Credit Budget Allocation (Free Tier Estimates)

| Category | Provider | Monthly Free Units | Priority |
|----------|----------|-------------------|----------|
| People Search | PDL | 100–500 req | Tier 1 |
| Email Discovery | Snov.io | 100 credits | Tier 1 |
| Email Verification | Mailcheck.ai | 1,000 verif | Tier 1 |
| Phone Validation | NumVerify | 100 lookups | Tier 1 |
| Proxy Requests | ScraperAPI | 5,000 req | Tier 1 |
| Company Registry | SEC EDGAR | Unlimited | Always-on |
| Tech Stack | Wappalyzer (self-hosted) | Unlimited | Always-on |
| Firmographic | OpenCorporates | 500 req/day | Always-on |

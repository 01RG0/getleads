# Tool: ScraperAPI
**Type:** Managed API
**Category:** Rotating API (residential + datacenter pool, auto-selected)
**Free Tier:** 5,000 requests/month
**CC Required:** No
**Priority Score:** 20
**Phase:** 0

## What It Does
ScraperAPI wraps any HTTP request in a managed rotating proxy pool, handling IP rotation, browser fingerprinting, CAPTCHA solving, and retry logic transparently. Rather than configuring a proxy address, workers pass their target URL as a query parameter to a single ScraperAPI endpoint. This makes it the lowest-friction proxy integration in the stack — one environment variable addition and every OSINT worker gains IP rotation.

## Free Tier Details
- **5,000 requests/month** — resets on the billing anniversary date
- **Hard block when limit hit** — returns HTTP 403 with `{"status": "limit_reached"}`. Workers must detect this and fall back to Webshare.io direct proxies.
- No geographic restriction on the free tier — all exit locations available
- Concurrent connections: 5 on free tier
- JS rendering (`render=true`) costs 5 credits per request on the free tier (1,000 effective JS renders)

## Auth & Connection
- **Auth method:** API key as query parameter
- **Endpoint:** `https://api.scraperapi.com/`
- **Connection format:**
  ```
  GET https://api.scraperapi.com/?api_key=YOUR_KEY&url=https://target.com
  ```
- **With JS rendering:**
  ```
  GET https://api.scraperapi.com/?api_key=YOUR_KEY&render=true&url=https://target.com
  ```
- **Environment variable:** `SCRAPERAPI_KEY`

## Docker Integration
```env
# .env / container env vars
SCRAPERAPI_KEY=your_api_key_here
SCRAPERAPI_ENDPOINT=https://api.scraperapi.com
```

```python
import os, requests

def scrape(url: str, render_js: bool = False) -> str:
    params = {"api_key": os.environ["SCRAPERAPI_KEY"], "url": url}
    if render_js:
        params["render"] = "true"
    resp = requests.get("https://api.scraperapi.com/", params=params, timeout=60)
    resp.raise_for_status()
    return resp.text
```

## LeadScale Worker Routing
- **Primary for:** crawl4ai requests, theHarvester web sources, phoneinfoga Google Dork queries, apify/gmap-scraper
- **Priority tier:** Primary (Phase 0) — route all OSINT web requests through ScraperAPI first
- **Do NOT use for:** SMTP handshake verification (Mailcheck.ai, ZeroBounce) — mail servers reject datacenter IPs; use direct outbound connection or residential-only proxies for SMTP
- **Do NOT use for:** holehe password-reset endpoint checks — ScraperAPI may cache/modify responses

## Limitations & Gotchas
- **Concurrency cap:** 5 simultaneous requests on free tier — queue OSINT workers or requests will return 429
- **5,000/month exhausts fast:** a single theHarvester run across 30 sources can consume 30–150 requests. Monitor usage via `https://api.scraperapi.com/account?api_key=KEY`
- **LinkedIn is blocked** by ScraperAPI on free tier — use Webshare.io residential + custom headers for LinkedIn-adjacent scraping
- **Response time:** 5–30s per request depending on target — set `timeout=60` minimum in all workers
- **Reliability:** Production-grade — 99.9% uptime SLA on paid tiers; free tier is best-effort

## Related Specs
- `../../integrations/lead_search_and_verification_apis.md` §7.1
- `../../INTEGRATION_PRIORITY.md` (rank 25, Phase 0)
- `../../architecture/data_pipeline.md`

## Code Upload Targets
- `src/tools/proxies/scraperapi/`
- `src/workers/proxy/`

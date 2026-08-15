# Tool: Crawlbase
**Type:** Managed API
**Category:** Rotating API (Static HTML + JS Dynamic endpoints)
**Free Tier:** 1,000 requests/month
**CC Required:** No
**Priority Score:** 15
**Phase:** 2

## What It Does
Crawlbase (formerly ProxyCrawl) provides two distinct scraping endpoints: a standard rotating proxy endpoint for static HTML and a headless Chrome endpoint for JS-rendered pages. Its key differentiator in the LeadScale stack is that both endpoints use the same API key and pricing, making it simple to route static vs dynamic requests through one integration. It also supports asynchronous scraping via a storage API — submit a batch of URLs and poll for results — which fits the LeadScale enrichment worker's async job queue pattern.

## Free Tier Details
- **1,000 requests/month** across both static and JS endpoints combined
- Static (`/crawl`) and JS (`/crawl?renderJS=true`) cost 1 credit each
- Hard cap: returns HTTP 429 when exhausted
- Asynchronous storage API available on free tier (submit → poll for result)
- No geographic restriction

## Auth & Connection
- **Auth method:** API token as `token` query parameter
- **Static HTML endpoint:**
  ```
  GET https://api.crawlbase.com/?token=YOUR_TOKEN&url=https://target.com
  ```
- **JS-rendered endpoint:**
  ```
  GET https://api.crawlbase.com/?token=YOUR_TOKEN&renderJS=true&url=https://target.com
  ```
- **Async submit (fire and poll):**
  ```
  POST https://api.crawlbase.com/crawl?token=YOUR_TOKEN
  Body: {"url": "https://target.com", "renderJS": true}
  → Returns {"rid": "request_id"}
  GET https://api.crawlbase.com/storage?token=YOUR_TOKEN&rid=request_id
  ```
- **Environment variable:** `CRAWLBASE_API_TOKEN`

## Docker Integration
```env
# .env / container env vars
CRAWLBASE_API_TOKEN=your_token_here
```

```python
import os, time, requests

def scrape_async(url: str, render_js: bool = False) -> str:
    token = os.environ["CRAWLBASE_API_TOKEN"]
    params = {"token": token, "url": url}
    if render_js:
        params["renderJS"] = "true"
    r = requests.get("https://api.crawlbase.com/", params=params, timeout=60)
    r.raise_for_status()
    return r.text
```

## LeadScale Worker Routing
- **Primary for:** Async batch enrichment jobs where the enrichment worker submits URLs and polls for results (fits the Redis job queue pattern), business directory scraping with mixed static/JS pages
- **Priority tier:** Phase 2 secondary — use when ScraperAPI and ScrapingBee credits are exhausted; particularly valuable for async batch patterns
- **Do NOT use for:** Real-time synchronous enrichment in the critical path (async mode adds latency), SMTP verification

## Limitations & Gotchas
- **Two separate API tokens** — Crawlbase issues separate tokens for the Normal (static) API and the JavaScript API; make sure to use the right one per endpoint
- **Async polling delay:** 5–30s for JS renders in async mode — implement exponential backoff on the poll loop
- **1,000 combined credits** exhausts quickly if mixing static + JS requests
- **Reliability:** Production-grade

## Related Specs
- `../../integrations/lead_search_and_verification_apis.md` §7.1
- `../../INTEGRATION_PRIORITY.md` (rank 45, Phase 2)

## Code Upload Targets
- `src/tools/proxies/crawlbase/`
- `src/workers/proxy/`

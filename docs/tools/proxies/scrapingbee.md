# Tool: ScrapingBee
**Type:** Managed API
**Category:** Rotating API with JS Rendering
**Free Tier:** 1,000 requests/month
**CC Required:** No
**Priority Score:** 15
**Phase:** 2

## What It Does
ScrapingBee is a scraping API that combines proxy rotation with a real headless Chrome browser, making it the right choice when the target page requires JavaScript execution to render its content — React/Vue SPAs, dynamically loaded company profiles, and paginated directory listings that populate via XHR. Unlike ScraperAPI's basic JS render, ScrapingBee uses a full Chrome instance and supports custom JavaScript execution, waiting for specific CSS selectors, and screenshot capture. In the LeadScale stack it acts as a specialised fallback for SPA/JS-heavy company websites that crawl4ai can't handle headlessly.

## Free Tier Details
- **1,000 requests/month** — non-JS requests cost 1 credit, JS-rendered requests cost 5 credits (effective 200 JS renders on free tier)
- Hard cap: returns HTTP 500 with `{"statusCode": 500, "message": "No credits left"}` when exhausted
- No geographic restriction on free tier
- Concurrent connections: 1 on free tier (queue requests)
- Screenshot feature available on free tier (costs same as JS render)

## Auth & Connection
- **Auth method:** API key as `api_key` parameter or `Authorization: Bearer` header
- **Basic HTML scrape:**
  ```
  GET https://app.scrapingbee.com/api/v1/?api_key=YOUR_KEY&url=https://target.com
  ```
- **JS-rendered scrape:**
  ```
  GET https://app.scrapingbee.com/api/v1/?api_key=YOUR_KEY&render_js=true&url=https://target.com
  ```
- **Wait for selector before returning:**
  ```
  GET ...&render_js=true&wait_for=%23main-content&url=...
  ```
- **Environment variable:** `SCRAPINGBEE_API_KEY`

## Docker Integration
```env
# .env / container env vars
SCRAPINGBEE_API_KEY=your_api_key_here
```

```python
import os, requests

def scrape_js(url: str, wait_selector: str = None) -> str:
    params = {"api_key": os.environ["SCRAPINGBEE_API_KEY"], "render_js": "true", "url": url}
    if wait_selector:
        params["wait_for"] = wait_selector
    resp = requests.get("https://app.scrapingbee.com/api/v1/", params=params, timeout=90)
    resp.raise_for_status()
    return resp.text
```

## LeadScale Worker Routing
- **Primary for:** JS-heavy company website scraping via crawl4ai fallback path, SPA-rendered business directory pages (G2, Clutch listings), dynamically loaded LinkedIn company pages
- **Priority tier:** Phase 2 secondary — invoke only when ScraperAPI returns incomplete HTML indicating JS-rendered content
- **Do NOT use for:** SMTP verification, simple static HTML pages (wastes JS credits), high-volume batch jobs (1,000 credits exhausts quickly at 5 credits/render)

## Limitations & Gotchas
- **Concurrency = 1 on free tier** — must queue all scraping requests; parallel workers will get queued/rejected
- **5 credits per JS render** = only 200 effective JS-rendered pages per month on free tier
- **Response time:** 10–60s for JS renders — set `timeout=120` for ScrapingBee worker calls
- **Custom JS execution** (`js_snippet` param) is available but untested on free tier limits — verify before relying on it
- **Reliability:** Production-grade on paid tier; free tier may be deprioritised during peak load

## Related Specs
- `../../integrations/lead_search_and_verification_apis.md` §7.1
- `../../INTEGRATION_PRIORITY.md` (rank 43, Phase 2)

## Code Upload Targets
- `src/tools/proxies/scrapingbee/`
- `src/workers/proxy/`

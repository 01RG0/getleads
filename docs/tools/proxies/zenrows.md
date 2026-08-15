# Tool: Zenrows
**Type:** Managed API
**Category:** Rotating API with Anti-Bot Bypass
**Free Tier:** 1,000 requests/month
**CC Required:** No
**Priority Score:** 15
**Phase:** 2

## What It Does
Zenrows is a scraping API specialising in anti-bot bypass — it handles Cloudflare, PerimeterX, Akamai Bot Manager, and similar protection layers that block standard proxy requests. Where ScraperAPI handles basic IP rotation and ScrapingBee handles JS rendering, Zenrows handles targets that actively fingerprint and block scrapers at the TLS/browser-behaviour level. In the LeadScale stack, Zenrows is the Phase 2 fallback for Cloudflare-protected company directories and tech vendor sites.

## Free Tier Details
- **1,000 requests/month** — each request = 1 credit regardless of JS rendering
- Hard cap: returns HTTP 422 with error message when credits exhausted
- Premium proxy (residential) mode costs 10 credits per request on free tier (100 effective residential requests)
- No geographic restriction
- Concurrent connections: 1 on free tier

## Auth & Connection
- **Auth method:** API key as `apikey` query parameter
- **Basic request:**
  ```
  GET https://api.zenrows.com/v1/?apikey=YOUR_KEY&url=https://target.com
  ```
- **With JS rendering:**
  ```
  GET https://api.zenrows.com/v1/?apikey=YOUR_KEY&js_render=true&url=https://target.com
  ```
- **With premium residential proxy:**
  ```
  GET https://api.zenrows.com/v1/?apikey=YOUR_KEY&premium_proxy=true&url=https://target.com
  ```
- **With anti-bot mode (full stealth):**
  ```
  GET https://api.zenrows.com/v1/?apikey=YOUR_KEY&antibot=true&js_render=true&url=https://target.com
  ```
- **Environment variable:** `ZENROWS_API_KEY`

## Docker Integration
```env
# .env / container env vars
ZENROWS_API_KEY=your_api_key_here
```

```python
import os, requests

def scrape_antibot(url: str, js_render: bool = False) -> str:
    params = {"apikey": os.environ["ZENROWS_API_KEY"], "url": url, "antibot": "true"}
    if js_render:
        params["js_render"] = "true"
    resp = requests.get("https://api.zenrows.com/v1/", params=params, timeout=90)
    resp.raise_for_status()
    return resp.text
```

## LeadScale Worker Routing
- **Primary for:** Cloudflare-protected company websites (common in fintech, cybersecurity, enterprise SaaS directories), Scrapling's fallback targets, any URL returning 403/429 via ScraperAPI
- **Priority tier:** Phase 2 specialist — use only when ScraperAPI and Webshare both fail on a target (anti-bot protection detected)
- **Do NOT use for:** High-volume batch scraping (1,000 credits gone quickly), SMTP checks, or any target where basic rotation works fine

## Limitations & Gotchas
- **1,000 credits/month is low** — Zenrows is a specialist tool, not a general-purpose proxy; use it surgically
- **JS + antibot + premium proxy = 10+ credits per request** — can exhaust free tier in 100 requests if all flags enabled
- **Response time:** 15–60s in full antibot mode
- **Some targets still block Zenrows** — no anti-bot service has 100% bypass rate; log failures and escalate to Scrapling with custom headers
- **Reliability:** Production-grade

## Related Specs
- `../../integrations/lead_search_and_verification_apis.md` §7.1
- `../../INTEGRATION_PRIORITY.md` (rank 44, Phase 2)

## Code Upload Targets
- `src/tools/proxies/zenrows/`
- `src/workers/proxy/`

# Tool: Geonode
**Type:** Managed API
**Category:** Residential Proxies
**Free Tier:** 1 GB/month bandwidth
**CC Required:** No
**Priority Score:** 20
**Phase:** 2

## What It Does
Geonode provides residential proxy IPs — addresses that belong to real ISP subscribers rather than datacenter ranges. Residential IPs are significantly harder for targets to detect and block compared to datacenter proxies, making Geonode the right choice for scraping LinkedIn-adjacent pages, Google search results, and any target that aggressively blocks datacenter IP ranges. The free tier gives 1 GB/month of residential bandwidth, accessed via standard `user:pass@host:port` format with rotating or sticky session modes.

## Free Tier Details
- **1 GB/month bandwidth** — residential traffic
- Hard cap: requests fail after 1 GB
- **Rotating mode:** new IP per request (default — best for OSINT workers)
- **Sticky session mode:** same IP for up to 10 minutes (use for multi-step workflows like form submissions)
- Geographic targeting available on free tier: pass `country=US` or `country=GB` in the proxy credentials
- Concurrent connections: up to 10 on free tier

## Auth & Connection
- **Auth method:** `username:password` with session/geo options encoded in the username
- **Rotating proxy endpoint:**
  ```
  http://username:password@rotating.geonode.com:9000
  https://username:password@rotating.geonode.com:9000
  ```
- **Sticky session (same IP for session):**
  ```
  http://username-session-RANDOM123:password@rotating.geonode.com:9001
  ```
- **With country targeting:**
  ```
  http://username-country-us:password@rotating.geonode.com:9000
  ```
- **Environment variables:**
  ```
  GEONODE_USERNAME=your_username
  GEONODE_PASSWORD=your_password
  GEONODE_HOST=rotating.geonode.com
  GEONODE_PORT=9000
  ```

## Docker Integration
```env
# .env / container env vars
GEONODE_USERNAME=your_username
GEONODE_PASSWORD=your_password
GEONODE_HOST=rotating.geonode.com
GEONODE_PORT=9000
```

```python
import os, requests

def get_residential_proxy(country: str = None) -> dict:
    user = os.environ["GEONODE_USERNAME"]
    if country:
        user = f"{user}-country-{country.lower()}"
    pwd = os.environ["GEONODE_PASSWORD"]
    proxy_url = f"http://{user}:{pwd}@{os.environ['GEONODE_HOST']}:{os.environ['GEONODE_PORT']}"
    return {"http": proxy_url, "https": proxy_url}
```

## LeadScale Worker Routing
- **Primary for:** LinkedIn-adjacent scraping (Surfe, Kaspr-style lookups), Google Dork queries (phoneinfoga), social platform OSINT (holehe, mosint)
- **Priority tier:** Secondary (Phase 2) — use when ScraperAPI is exhausted or when a datacenter IP is blocked by target
- **Preferred over Webshare** for: any target site that has Cloudflare anti-bot, Google Search, LinkedIn company pages
- **Do NOT use for:** SMTP verification — residential IPs can be misidentified as compromised consumer machines by mail servers

## Limitations & Gotchas
- **1 GB/month is very limited for residential** — residential proxies generate more per-request overhead; expect ~500–800 effective page loads
- **Rotating mode breaks session-based targets** — use sticky session (port 9001) for any multi-step interaction
- **Speed:** residential proxies are 2–5x slower than datacenter — set `timeout=90` for worker requests through Geonode
- **Reliability:** Production-grade for residential tier — Geonode maintains active proxy validation

## Related Specs
- `../../integrations/lead_search_and_verification_apis.md` §7.1
- `../../INTEGRATION_PRIORITY.md` (rank 27, Phase 2)

## Code Upload Targets
- `src/tools/proxies/geonode/`
- `src/workers/proxy/`

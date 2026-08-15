# Tool: Webshare.io
**Type:** Managed API
**Category:** Datacenter Proxies (dedicated static IPs)
**Free Tier:** 10 proxies, 1 GB/month bandwidth
**CC Required:** No
**Priority Score:** 20
**Phase:** 0

## What It Does
Webshare provides a pool of dedicated datacenter proxy IPs accessible via standard HTTP/HTTPS `user:pass@host:port` format. Unlike API-based proxies (ScraperAPI, ScrapingBee), Webshare gives you actual proxy addresses you can plug directly into any `HTTPS_PROXY` environment variable or requests session. This makes it the best zero-cost option for workers that need direct proxy control rather than an API wrapper — particularly useful for tools like theHarvester and Crosslinked that accept proxy arguments natively.

## Free Tier Details
- **10 dedicated datacenter proxy IPs** — static, assigned to your account
- **1 GB/month bandwidth** — shared across all 10 proxies
- Hard bandwidth cap: requests fail after 1 GB with HTTP 402
- No geographic selection on free tier — exit locations are US/EU datacenters (varies by assignment)
- Proxy list is downloadable as plaintext from the Webshare dashboard

## Auth & Connection
- **Auth method:** `username:password` per proxy IP
- **Connection format:**
  ```
  http://username:password@proxy_host:port
  https://username:password@proxy_host:port
  ```
- **Proxy list endpoint (API):**
  ```
  GET https://proxy.webshare.io/api/v2/proxy/list/?mode=direct&page=1&page_size=10
  Authorization: Token YOUR_API_TOKEN
  ```
- **Environment variables:**
  ```
  WEBSHARE_API_TOKEN=your_token
  WEBSHARE_PROXY_LIST=host1:port:user:pass,host2:port:user:pass,...
  ```

## Docker Integration
```env
# .env / container env vars
WEBSHARE_API_TOKEN=your_token_here
# Populated at container start by fetching /api/v2/proxy/list/
WEBSHARE_PROXY_LIST=
```

```python
import os, random, requests

def get_proxy_session() -> requests.Session:
    proxies_raw = os.environ["WEBSHARE_PROXY_LIST"].split(",")
    host, port, user, pwd = random.choice(proxies_raw).split(":")
    proxy_url = f"http://{user}:{pwd}@{host}:{port}"
    s = requests.Session()
    s.proxies = {"http": proxy_url, "https": proxy_url}
    return s
```

## LeadScale Worker Routing
- **Primary for:** theHarvester (pass `--proxy` arg), Crosslinked LinkedIn enumeration, direct HTTP scraping workers that need a real proxy address
- **Priority tier:** Primary (Phase 0) alongside ScraperAPI — use when ScraperAPI 5k limit is exhausted or when a tool needs a raw proxy address rather than an API wrapper
- **Do NOT use for:** SMTP verification — datacenter IPs are commonly blacklisted by mail servers
- **Do NOT use for:** LinkedIn at scale — datacenter IPs trigger LinkedIn's bot detection quickly; use Geonode residential for LinkedIn-adjacent work

## Limitations & Gotchas
- **1 GB/month is tight:** a single crawl4ai deep-scrape session can consume 50–200 MB; budget accordingly
- **Datacenter IPs** are more likely to be blocked by targets like Google, LinkedIn, and Cloudflare-protected sites than residential IPs
- **Static IPs:** if one IP gets banned by a target, it stays banned until you rotate your Webshare proxy assignment (manual via dashboard or API)
- **Fetch proxy list at container startup** — don't hardcode IPs in env vars; fetch fresh from `/api/v2/proxy/list/` each time the container starts to pick up any IP changes
- **Reliability:** Production-grade for general datacenter use

## Related Specs
- `../../integrations/lead_search_and_verification_apis.md` §7.1
- `../../INTEGRATION_PRIORITY.md` (rank 26, Phase 0)

## Code Upload Targets
- `src/tools/proxies/webshare/`
- `src/workers/proxy/`

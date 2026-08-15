# Tool: IPRoyal
**Type:** Managed API
**Category:** Residential Proxies
**Free Tier:** 500 MB/month bandwidth
**CC Required:** No
**Priority Score:** 15
**Phase:** 2

## What It Does
IPRoyal provides residential proxy IPs with a small free tier — 500 MB/month — accessed via standard `user:pass@host:port` format. As a residential proxy pool it complements Geonode (also residential, also free-no-CC) and provides a secondary residential fallback when Geonode's 1 GB monthly bandwidth is consumed. IPRoyal supports both rotating and sticky session modes and offers country-level geo-targeting on the free tier.

## Free Tier Details
- **500 MB/month** residential bandwidth — no CC required
- Hard bandwidth cap: proxy returns connection refused after 500 MB
- Rotating mode: new IP per connection (default)
- Sticky session: same IP held for configurable duration (1–60 minutes)
- Country-level targeting available: pass country code in the username
- Concurrent connections: up to 5 on free tier

## Auth & Connection
- **Auth method:** `username:password` with options encoded in username
- **Rotating endpoint:**
  ```
  http://username:password@geo.iproyal.com:12321
  https://username:password@geo.iproyal.com:12321
  ```
- **With country targeting (e.g. US):**
  ```
  http://username_country-us:password@geo.iproyal.com:12321
  ```
- **Sticky session (30-minute hold):**
  ```
  http://username_session-UNIQUE_SESSION_ID:password@geo.iproyal.com:12321
  ```
- **Environment variables:**
  ```
  IPROYAL_USERNAME=your_username
  IPROYAL_PASSWORD=your_password
  IPROYAL_HOST=geo.iproyal.com
  IPROYAL_PORT=12321
  ```

## Docker Integration
```env
# .env / container env vars
IPROYAL_USERNAME=your_username
IPROYAL_PASSWORD=your_password
IPROYAL_HOST=geo.iproyal.com
IPROYAL_PORT=12321
```

```python
import os, requests

def get_iproyal_proxy(country: str = None, sticky_id: str = None) -> dict:
    user = os.environ["IPROYAL_USERNAME"]
    if country:
        user = f"{user}_country-{country.lower()}"
    if sticky_id:
        user = f"{user}_session-{sticky_id}"
    pwd = os.environ["IPROYAL_PASSWORD"]
    host = os.environ["IPROYAL_HOST"]
    port = os.environ["IPROYAL_PORT"]
    proxy_url = f"http://{user}:{pwd}@{host}:{port}"
    return {"http": proxy_url, "https": proxy_url}
```

## LeadScale Worker Routing
- **Primary for:** Secondary residential fallback when Geonode 1 GB is exhausted; geo-targeted OSINT requests requiring US or EU exit nodes
- **Priority tier:** Phase 2 tertiary residential — Geonode → IPRoyal in the residential fallback chain
- **Do NOT use for:** SMTP verification, high-volume batch jobs (500 MB is very limited)

## Limitations & Gotchas
- **500 MB/month is very limited** — at average ~150 KB per residential page load, this gives roughly 3,300 effective page loads; deplete quickly with deep scraping
- **Residential proxy speed:** 3–8 seconds per request — set `timeout=60` minimum
- **IP quality:** residential IPs from IPRoyal are peer-sourced (users opt in for bandwidth sharing) — ethical concerns noted; check IPRoyal's network consent documentation before production use
- **Reliability:** Production-grade for residential tier

## Related Specs
- `../../integrations/lead_search_and_verification_apis.md` §7.1
- `../../INTEGRATION_PRIORITY.md` (rank 46, Phase 2)

## Code Upload Targets
- `src/tools/proxies/iproyal/`
- `src/workers/proxy/`

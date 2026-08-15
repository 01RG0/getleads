# Tool: PROXY-List (TheSpeedX)
**Type:** Free List (GitHub auto-updated)
**Category:** Free Public Proxy Seed Lists
**Free Tier:** Unlimited — public GitHub repo
**CC Required:** No
**Priority Score:** 15
**Phase:** 0

## What It Does
TheSpeedX/PROXY-List is a GitHub repository that auto-updates multiple times per day with fresh lists of free public HTTP, HTTPS, SOCKS4, and SOCKS5 proxies. It's not a proxy service — it's a seed list. In the LeadScale stack its role is to feed proxybroker2's validation pipeline: containers fetch the raw proxy lists on startup, proxybroker2 validates them for liveness and anonymity, and the validated subset becomes the emergency free proxy pool. It's also useful standalone for any worker that needs a quick list of IPs to try (with appropriate retry/fallback logic).

**GitHub:** https://github.com/TheSpeedX/PROXY-List
**Stars:** 15,000+
**License:** MIT
**Last Update:** Multiple times per day (automated)

## Free Tier Details
- Completely free — public GitHub raw file access
- No rate limit on fetching the list files (standard GitHub raw content CDN)
- Lists updated every 6–12 hours automatically via GitHub Actions
- Typical list sizes: HTTP ~3,000–8,000 proxies, SOCKS5 ~2,000–5,000 proxies
- Quality: raw unvalidated list — 60–80% of listed proxies are dead at any moment; always validate before use

## Available List URLs (raw GitHub)

```
HTTP proxies:
https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt

SOCKS4 proxies:
https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks4.txt

SOCKS5 proxies:
https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt
```

Each file is a plain-text list of `host:port` entries, one per line.

## Docker Integration

```env
# No env vars required — public URLs, no auth
PROXY_LIST_HTTP_URL=https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt
PROXY_LIST_SOCKS5_URL=https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt
```

```python
import requests, random

def fetch_proxy_list(list_type: str = "http") -> list[str]:
    urls = {
        "http": "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt",
        "socks5": "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt",
    }
    resp = requests.get(urls[list_type], timeout=15)
    resp.raise_for_status()
    return [line.strip() for line in resp.text.splitlines() if ":" in line]

def get_random_proxy(list_type: str = "http") -> dict:
    proxies = fetch_proxy_list(list_type)
    proxy = random.choice(proxies)
    return {"http": f"{list_type}://{proxy}", "https": f"{list_type}://{proxy}"}
```

## Container Startup Pattern
Fetch and validate on container start before OSINT workers begin:

```bash
# In container entrypoint — fetch lists and pipe to proxybroker2
curl -s https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt \
  >> /tmp/proxy-seed.txt
curl -s https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt \
  >> /tmp/proxy-seed.txt
# proxybroker2 reads and validates from this file
proxybroker find --types HTTP HTTPS --lvl Anonymous --outfile /tmp/validated-proxies.txt
```

## LeadScale Worker Routing
- **Use for:** Seeding proxybroker2's validation pipeline on container startup; emergency fallback when all paid proxy budgets exhausted
- **Priority tier:** Phase 0 setup (fetching the list is trivial) but the proxies themselves are Phase 3 emergency-only
- **Do NOT use for:** Any production SLA path — raw unvalidated public proxies have ~60–80% failure rate; SLA guarantee requires managed proxies

## Limitations & Gotchas
- **Most proxies are dead** at fetch time — always validate with proxybroker2 before routing real requests
- **Public proxies leak traffic** — never route requests containing API keys, auth tokens, or PII through unvalidated public proxies; use only for fetching public web pages
- **GitHub rate limits:** fetching the raw URL more than ~60 times/hour from the same IP may hit GitHub's anonymous rate limit; cache the list locally after each fetch
- **Proxy churn:** quality and availability shift daily — re-seed and re-validate every 12–24 hours via a cron job in the container

## Related Specs
- `../../integrations/opensource_leadgen_and_osint_tools.md` §8
- `../../INTEGRATION_PRIORITY.md` (rank 47, Phase 2 — easy fetch, but proxies are Phase 3 quality)
- [proxybroker2.md](proxybroker2.md) — consumes this list

## Code Upload Targets
- `src/tools/proxies/proxy-list-speedx/`
- `src/workers/proxy/`

# Tool: proxybroker2
**Type:** Self-Hosted OSS
**Category:** Free Public Proxy Validator + Rotating Pool Server
**Free Tier:** Unlimited (self-hosted)
**CC Required:** No
**Priority Score:** 9
**Phase:** 3

## What It Does
proxybroker2 is a Python tool that continuously crawls free public proxy lists, validates each proxy for liveness and anonymity level, and serves the validated pool as a local rotating proxy server on `127.0.0.1:8888`. OSINT workers route through this local endpoint and proxybroker2 handles rotation behind the scenes. It's the zero-cost emergency fallback when all paid proxy budgets are exhausted — but public proxy pools are inherently unreliable, slow, and unsuitable for any SLA-critical path.

**GitHub:** https://github.com/constverum/proxybroker2
**Stars:** 1,500+
**License:** Apache-2.0
**Last Commit:** 2025

## Free Tier Details
- Completely free — uses publicly available free proxy lists as source
- Works best seeded from TheSpeedX/PROXY-List (see `proxy-list-speedx.md`)
- Pool size depends on validation results — typically 50–300 live proxies at any time
- Throughput: low (public proxies are 1–20 Kbps typical)
- No bandwidth cap — limited only by available validated proxies

## Docker Integration

```dockerfile
# Dockerfile for proxybroker2 sidecar
FROM python:3.11-slim
RUN pip install proxybroker2 aiohttp[speedups]
EXPOSE 8888
CMD ["proxybroker", "serve", "--host", "0.0.0.0", "--port", "8888", "--types", "HTTP", "HTTPS", "--lvl", "Anonymous", "--max-tries", "3"]
```

```bash
# docker-compose sidecar service
docker run -d \
  --name proxybroker-sidecar \
  --network leadscale_worker_net \
  -p 8888:8888 \
  leadscale/proxybroker2
```

```python
import requests

def get_public_proxy_session() -> requests.Session:
    # proxybroker2 serves validated proxies at localhost:8888
    proxy_url = "http://127.0.0.1:8888"
    s = requests.Session()
    s.proxies = {"http": proxy_url, "https": proxy_url}
    return s
```

## Container Sidecar Pattern
Run proxybroker2 as a sidecar container in the same Docker network as OSINT workers:
1. proxybroker2 container starts, seeds from TheSpeedX PROXY-List, validates proxies
2. OSINT workers connect to `http://proxybroker-sidecar:8888` as their proxy endpoint
3. proxybroker2 rotates IPs transparently on each connection

## LeadScale Worker Routing
- **Use for:** Low-sensitivity, high-volume scraping where failure is acceptable — bulk domain validation, public web directory scanning, initial company discovery sweeps
- **Priority tier:** Phase 3 emergency fallback — only when all paid proxy budgets (ScraperAPI, Webshare, Geonode) are exhausted for the month
- **Do NOT use for:** SMTP verification, LinkedIn scraping, any SLA-guaranteed enrichment pipeline stage, holehe or mosint checks (need reliable connections)

## Limitations & Gotchas
- **Unreliable by nature** — public proxies come and go; expect 20–50% request failure rate; always implement retry logic
- **Slow:** 5–30s per request through public proxies; unsuitable for real-time enrichment
- **Anonymity not guaranteed** — some public proxies are transparent (leak real IP) even after `--lvl Anonymous` filter; do not use for scraping targets that ban IPs
- **Startup delay:** 2–5 minutes for initial proxy validation on cold start; don't route workers through it until the pool is populated
- **Not production-grade** — categorised as best-effort / emergency fallback only

## Related Specs
- `../../integrations/opensource_leadgen_and_osint_tools.md` §8
- `../../INTEGRATION_PRIORITY.md` (rank 65, Phase 3)
- [proxy-list-speedx.md](proxy-list-speedx.md) — seed source

## Code Upload Targets
- `src/tools/proxies/proxybroker2/`
- `src/workers/proxy/`

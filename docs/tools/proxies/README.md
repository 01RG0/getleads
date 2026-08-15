# Proxy Tools — Index
## Project: LeadScale B2B Platform

All proxy and IP-rotation services used by the OSINT worker fleet. Sorted by priority score (from `docs/INTEGRATION_PRIORITY.md`).

---

## Managed / Hosted

| File | Tool | Type | Free Tier | CC? | Priority Score | Phase |
|------|------|------|-----------|-----|----------------|-------|
| [scraperapi.md](scraperapi.md) | ScraperAPI | Rotating API | 5,000 req/mo | No | 20 | 0 |
| [webshare.md](webshare.md) | Webshare.io | Datacenter | 10 proxies + 1 GB/mo | No | 20 | 0 |
| [geonode.md](geonode.md) | Geonode | Residential | 1 GB/mo | No | 20 | 2 |
| [scrapingbee.md](scrapingbee.md) | ScrapingBee | Rotating API + JS | 1,000 req/mo | No | 15 | 2 |
| [zenrows.md](zenrows.md) | Zenrows | Rotating API + anti-bot | 1,000 req/mo | No | 15 | 2 |
| [crawlbase.md](crawlbase.md) | Crawlbase | Rotating API | 1,000 req/mo | No | 15 | 2 |
| [iproyal.md](iproyal.md) | IPRoyal | Residential | 500 MB/mo | No | 15 | 2 |

## Self-Hosted / OSS

| File | Tool | Type | Cost | License | Priority Score | Phase |
|------|------|------|------|---------|----------------|-------|
| [proxybroker2.md](proxybroker2.md) | proxybroker2 | Validates + serves free public proxies | Free | Apache-2.0 | 9 | 3 |
| [goproxy.md](goproxy.md) | goproxy | Proxy relay/gateway server | Free | MIT | 9 | 3 |
| [proxy-list-speedx.md](proxy-list-speedx.md) | PROXY-List (TheSpeedX) | Auto-updated free proxy lists | Free | MIT | 15 | 0 |

---

## Proxy Waterfall Priority

```
Phase 0 (production):   ScraperAPI → Webshare.io
Phase 2 (expanded):     Geonode → ScrapingBee → Zenrows → Crawlbase → IPRoyal
Phase 3 (self-hosted):  PROXY-List seed → proxybroker2 pool → goproxy gateway
```

Never route SMTP verification workers through public proxy pools (proxybroker2 / PROXY-List) — use only managed services for mail-server handshakes.

## Related Specs
- `../../integrations/lead_search_and_verification_apis.md` §7
- `../../integrations/opensource_leadgen_and_osint_tools.md` §8
- `../../INTEGRATION_PRIORITY.md`

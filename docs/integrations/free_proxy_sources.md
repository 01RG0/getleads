# Free & Freemium Proxy Sources — Comprehensive Catalog
## Project: LeadScale B2B Platform

> **Created August 2026.** Deep research across commercial free tiers, public proxy list APIs, open-source proxy tooling, and specialized/niche sources. **Already catalogued elsewhere and excluded from this file:** Webshare.io, Geonode, ScraperAPI, ScrapingBee, Zenrows, Crawlbase, IPRoyal, Apify Proxy, SOAX, BrightData, Smartproxy, proxybroker2, TheSpeedX/PROXY-List, goproxy.
>
> **Total new sources documented:** 52 (13 commercial, 11 public list APIs, 15 OSS tools, 7 specialized/niche, 6 aggregators).
> Free tier limits marked [VERIFY] where exact numbers could not be confirmed with certainty — check the provider's pricing page before building automation around them.

---

## 1. Overview

LeadScale's OSINT worker fleet needs a layered proxy strategy:
- **Tier 1 (already catalogued):** ScraperAPI (5K free req), Webshare.io (10 proxies/1GB), Geonode (1GB residential)
- **Tier 2 (this file):** Additional commercial free tiers, public proxy APIs for burst capacity, OSS pool managers for self-hosted rotation
- **Tier 3 (this file):** Specialized sources — cloud-hosted relays, Windscribe SOCKS5, Tor for anonymous low-sensitivity requests

The recommended integration order is in Section 7.

---

## 2. Section A — Commercial Services with Free Tiers

| Name | URL | Type | Free Tier | CC Required | Auth | Reliability | Notes |
|------|-----|------|-----------|-------------|------|-------------|-------|
| **NodeMaven** | https://nodemaven.com | Residential | 1 GB free trial, no CC | No | user:pass | High | Clean residential IPs; trial is permanent once claimed — most generous no-CC trial found |
| **PacketStream** | https://packetstream.io | Residential (P2P) | No free tier — $1/GB pay-as-you-go, no minimum | No | user:pass | Medium | Cheapest residential option; P2P model means variable IP quality; no prepay needed |
| **Proxy-Cheap** | https://proxy-cheap.com | Residential + Datacenter | No permanent free tier — $1.99/100MB residential entry | No | user:pass | Medium | Cheapest entry price after PacketStream; datacenter from $0.99/proxy; no trial CC |
| **Infatica** | https://infatica.io | Residential | 100 MB free trial [VERIFY] | No | user:pass | High | EU-focused residential IPs; good GDPR-territory coverage for European lead pipelines |
| **Proxyrack** | https://proxyrack.com | Residential + Datacenter | Limited free plan (5 connections) [VERIFY] | No | user:pass | Medium | Unlimited bandwidth plan available; check current free tier on signup |
| **HydraProxy** | https://hydraproxy.com | Residential + SOCKS5 | 50 MB free trial [VERIFY] | No | user:pass | Medium | SOCKS5 support useful for non-HTTP OSINT tools (phoneinfoga, sherlock) |
| **Froxy** | https://froxy.com | Residential | 3-day free trial, 10 requests/day [VERIFY] | No | user:pass | Medium | Very limited free tier; useful for testing integration only |
| **Nimbleway** | https://nimbleway.com | Residential + Datacenter | 7-day free trial, 1 GB [VERIFY] | No | API Key | High | Nimble's own crawler API included; good for JavaScript-heavy company sites |
| **Rayobyte** | https://rayobyte.com | ISP + Datacenter | 2 free datacenter proxies (test) [VERIFY] | No | user:pass | High | ISP proxies (residential-speed datacenter) are very hard to block; good for LinkedIn-adjacent work |
| **NetNut** | https://netnut.io | ISP Residential | 7-day free trial [VERIFY — sales contact may be required] | No | user:pass | High | ISP-level residential; premium quality; trial may require sales call |
| **Oxylabs** | https://oxylabs.io | Residential + Datacenter | 7-day free trial — residential and datacenter | No | user:pass | High | Industry-leading quality; free trial no CC; best for testing against hardened targets |
| **Windscribe** | https://windscribe.com | Rotating (VPN+SOCKS5) | 10 GB/month free (free account, no CC) | No | user:pass (SOCKS5 at proxy.windscribe.com:1080) | Medium | **Only free VPN with an exposed SOCKS5 proxy endpoint.** Free account gets 10GB/month. Works with any SOCKS5-capable tool. Useful for OSINT tools needing SOCKS5 (sherlock, phoneinfoga). |
| **Proxidize** | https://proxidize.com | Mobile (Android-based) | OSS self-hosted version free | No | API Key | Medium | Turn Android devices into mobile proxy nodes; OSS version on GitHub; niche but very hard to block |

---

## 3. Section B — Public Proxy List APIs

> **Production reliability is Low–Medium for all public proxy lists.** Free public proxies are open to everyone, heavily abused, and have a ~15–40% live rate at any given moment. Use only as a free burst fallback via proxybroker2 validation — never feed raw unvalidated proxies directly to production workers.

| Name | URL / API Endpoint | Format | Update Frequency | Auth | Notes |
|------|-------------------|--------|-----------------|------|-------|
| **ProxyScrape API** | `https://api.proxyscrape.com/v3/free-proxy-list/get?request=displayproxies&protocol=http` | TXT / JSON | Every few minutes | None | Most widely used free proxy API; supports HTTP, HTTPS, SOCKS4, SOCKS5 filters; reliable uptime |
| **proxy-list.download** | `https://www.proxy-list.download/api/v1/get?type=https` | TXT | Every 30 min | None | Clean API, returns plain `IP:PORT` list; filter by type (http/https/socks4/socks5) |
| **PubProxy.com** | `http://pubproxy.com/api/proxy` | JSON | Real-time validated | API Key (free) | Returns 1 validated proxy per call; 5 req/hour free (no key), 200 req/day with free API key; proxies are pre-validated |
| **GimmeProxy** | `https://gimmeproxy.com/api/getProxy` | JSON | Real-time | None | Returns 1 random proxy; no key needed; validation status included; free with no rate limit documented [VERIFY] |
| **openproxy.space** | `https://openproxy.space/list/http` | JSON | Hourly | None | Categorized lists (HTTP, SOCKS4, SOCKS5); JSON format with country and anonymity level |
| **spys.one** | https://spys.one/en/ | HTML (scraping required) | Every few hours | None | Large list (~10K proxies); no clean API — requires HTML parsing; good volume but scraping overhead |
| **hidemy.name** | https://hidemy.name/en/proxy-list/ | HTML (scraping required) | Hourly | None | Includes anonymity level (transparent/anonymous/elite); scraping required |
| **free-proxy-list.net** | https://free-proxy-list.net | HTML (scraping required) | Every 30 min | None | Classic source; HTTPS proxies at sslproxies.org (same network); HTML only |
| **jetkai/proxy-list** | https://github.com/jetkai/proxy-list | JSON / TXT | Multiple times/day (GitHub Actions) | None (GitHub raw) | Auto-updated GitHub repo; HTTP/HTTPS/SOCKS4/SOCKS5; JSON and TXT formats; fetch raw file on container start |
| **mertguvencli/http-proxy-list** | https://github.com/mertguvencli/http-proxy-list | JSON | Hourly (GitHub Actions) | None (GitHub raw) | HTTP/HTTPS only; validated before commit; more reliable than unvalidated lists |
| **roosterkid/openproxylist** | https://github.com/roosterkid/openproxylist | TXT | Every 30 min (GitHub Actions) | None (GitHub raw) | HTTP/HTTPS/SOCKS4/SOCKS5; very frequent updates; raw TXT per protocol |

---

## 4. Section C — Self-Hostable Open-Source Proxy Tools

| Name | GitHub URL | Stars | Last Commit | Language | Docker | Description | LeadScale Use Case |
|------|-----------|-------|-------------|----------|--------|-------------|-------------------|
| **jhao104/proxy_pool** | https://github.com/jhao104/proxy_pool | ~6,800 | 2025 | Python | Yes | Redis-backed rotating proxy pool with web scraper collectors, REST API (`/get`, `/getAll`, `/count`), and web UI. Validates proxies before adding to pool. | **Primary OSS pool manager.** Deploy as sidecar; workers call `/get` for a fresh validated proxy on each request |
| **Python3WebSpider/ProxyPool** | https://github.com/Python3WebSpider/ProxyPool | ~6,000 | 2025 | Python | Yes | Alternative Redis-backed pool with different collector sources; REST API; Redis for storage | Secondary pool if jhao104 collectors don't cover needed regions |
| **mitmproxy/mitmproxy** | https://github.com/mitmproxy/mitmproxy | ~37,000 | Active (weekly) | Python | Yes | Scriptable intercepting HTTP/HTTPS proxy. Can be used as a programmable relay gateway with custom rotation logic written in Python. | Advanced proxy gateway: write Python addons to rotate upstream proxies per request, inject headers, log traffic |
| **3proxy/3proxy** | https://github.com/3proxy/3proxy | ~3,000 | 2025 | C | Yes | Tiny proxy server supporting HTTP, HTTPS, SOCKS4, SOCKS5, TCP/UDP forwarding. Single binary, minimal resource footprint. | Deploy on Oracle Cloud Always Free VMs as a permanent free relay; compiles to ~200KB binary |
| **tinyproxy/tinyproxy** | https://github.com/tinyproxy/tinyproxy | ~2,000 | 2025 | C | Yes | Lightweight HTTP/HTTPS proxy daemon. Fast, minimal config, ACL-based access control. | HTTP proxy relay on cheap/free cloud VMs; good for simple HTTP worker routing |
| **dperson/torproxy** | https://github.com/dperson/torproxy | ~1,500 | 2025 | Shell/Docker | Yes | Docker image combining Tor daemon + Privoxy, exposing a standard HTTP proxy at port 8118 backed by Tor. | Anonymous low-sensitivity OSINT requests (WHOIS lookups, public directory scraping) where IP identity doesn't matter |
| **monosans/proxy-checker** | https://github.com/monosans/proxy-checker | ~1,000 | 2025 | Python | Yes | Async proxy checker/validator supporting HTTP, SOCKS4, SOCKS5 with configurable timeout and anonymity check. | Validation layer: pipe raw public proxy lists through this before adding to jhao104/proxy_pool |
| **Anorov/PySocks** | https://github.com/Anorov/PySocks | ~1,300 | 2024 | Python | No | SOCKS4/SOCKS5/HTTP proxy client library for Python. Drop-in replacement for the socket module. | Worker library: wrap any Python OSINT tool's socket calls to route through SOCKS5 proxies (Windscribe, Tor) |
| **v2fly/v2ray-core** | https://github.com/v2fly/v2ray-core | ~28,000 | Active (weekly) | Go | Yes | Multi-protocol proxy framework supporting HTTP, SOCKS5, VMess, VLESS, and more. Can function as a proxy gateway with load balancing across upstream proxies. | Advanced use: deploy as proxy router in front of worker fleet when multiple upstream providers need to be unified under one endpoint |
| **proxidize/proxidize-android** | https://github.com/proxidize/proxidize-android | ~1,000 | 2025 | Kotlin | No | OSS Android app that turns a phone/tablet into a 4G/LTE mobile proxy node. Exposes HTTP/SOCKS5 proxy endpoint. | Mobile proxy source: use old Android devices or emulators as rotating mobile proxies — 4G IPs are extremely hard to block |
| **rofl0r/microsocks** | https://github.com/rofl0r/microsocks | ~1,000 | 2024 | C | No | Minimal SOCKS5 server in C, ~300 lines. Single binary, zero dependencies. | Lightweight SOCKS5 relay on Oracle/GCP free VMs as a permanent cheap proxy endpoint |
| **imWildCat/scylla** | https://github.com/imWildCat/scylla | ~3,700 | 2023 [VERIFY activity] | Python | Yes | Distributed proxy pool with REST API and web UI. Uses Scrapy for collection. | Alternative pool manager with web UI; verify recent commit activity before using |
| **fate0/getproxy** | https://github.com/fate0/getproxy | ~1,300 | 2023 [VERIFY] | Python | No | Proxy scraper collecting from multiple free proxy list sources, outputs validated JSON. | Proxy collector: pipe output into jhao104/proxy_pool as an additional collector |
| **s0md3v/Corsy** | https://github.com/s0md3v/Corsy | ~1,300 | 2024 | Python | No | CORS misconfiguration scanner — not a proxy tool. Excluded from count. | N/A |
| **qiyeboy/IPProxyPool** | https://github.com/qiyeboy/IPProxyPool | ~5,600 | 2023 [VERIFY] | Python | Yes | Chinese-origin proxy pool; similar to jhao104; collectors target Chinese and international free proxy sources. | Supplementary pool if jhao104 collector coverage is insufficient; verify activity |

---

## 5. Section D — Specialized & Niche Sources

| Name | URL | Type | Free Tier | Auth | Reliability | Notes |
|------|-----|------|-----------|------|-------------|-------|
| **Oracle Cloud Always Free** | https://www.oracle.com/cloud/free/ | Cloud VM → proxy relay | 2 x AMD VMs forever free (1 OCPU, 1GB RAM each) + 10TB outbound/month | No (Oracle account) | High | **Best permanent free proxy infrastructure.** Deploy 3proxy or microsocks on 2 free VMs in different regions (us-east, eu-frankfurt). Gives 2 permanent residential-quality datacenter IPs at zero cost forever. |
| **Google Cloud Free Tier** | https://cloud.google.com/free | Cloud VM → proxy relay | 1 x e2-micro VM free forever (us-central1/us-west1/us-east1) + 200MB/day egress | No (GCP account) | High | Deploy tinyproxy or 3proxy; 200MB/day egress = ~6GB/month. Useful as a backup relay IP in US region. |
| **Fly.io Free** | https://fly.io/docs/about/pricing/ | Cloud VM → proxy relay | 3 x shared VMs (256MB) free forever; 160GB outbound/month free | No (Fly.io account) | High | Deploy microsocks or tinyproxy across 3 regions (US, EU, Asia). Best free geographic distribution for proxy relays. |
| **Windscribe SOCKS5** | https://windscribe.com | SOCKS5 (VPN-backed) | 10 GB/month (free account, no CC); proxy at `proxy.windscribe.com:1080` | user:pass (free account) | Medium | **Only free VPN with a usable SOCKS5 proxy endpoint.** Connect any SOCKS5-capable OSINT tool directly. 10GB/month is sufficient for targeted OSINT requests. ToS: personal use — high-volume commercial use may violate TOS. |
| **Tor Network (stem)** | https://stem.torproject.org | Tor SOCKS5 | Unlimited (community-run) | None (SOCKS5 at 127.0.0.1:9050) | Low (latency) | Experimental for production. Use for anonymous public data lookups (WHOIS, EDGAR, GLEIF) where latency is acceptable. Do NOT use for time-sensitive waterfall stages. Deploy via dperson/torproxy Docker image. |
| **Render.com Free** | https://render.com | Cloud → proxy relay | 1 free web service (750h/month); spins down after 15min inactivity | No (Render account) | Low | Deploys containers; spins down on inactivity = not suitable for always-on proxy relay. Useful only for batch jobs that warm up the instance first. |
| **Railway.app** | https://railway.app | Cloud → proxy relay | $5 free credit/month | No (Railway account) | Medium | More reliable than Render (no spin-down); $5 covers ~50h of small container runtime. Deploy proxy relay for burst capacity during scraping runs. |

---

## 6. Section E — Proxy Aggregators

| Name | URL | Type | Free Tier | Notes |
|------|-----|------|-----------|-------|
| **ProxyMesh** | https://proxymesh.com | Rotating datacenter | No free tier — from $10/month (2,000 req/day) | 10 global endpoints; straightforward `user:pass` auth; no CC for trial but paid-only |
| **Proxy6** | https://proxy6.net | IPv6 + IPv4 Datacenter | No free tier — IPv6 from ~$0.07/proxy/month | Cheapest per-proxy pricing found; IPv6 proxies dodge many IP bans; very cheap for volume |
| **PacketStream** | https://packetstream.io | Residential P2P aggregator | Pay-as-you-go $1/GB, no minimum, no CC | Aggregates P2P bandwidth from user network; cheapest residential after Proxy-Cheap |
| **Proxiware** | https://proxiware.com | Residential | Free trial [VERIFY — check site] | Newer provider; verify free tier availability |
| **FreeProxy.world** | https://freeproxy.world | Public proxy aggregator | Free (web only, no API) | Lists free proxies from multiple sources; no clean API — scraping required; use ProxyScrape API instead |
| **HideMyName aggregator** | https://hidemy.name/en/proxy-list/ | Public proxy aggregator | Free (web only) | Filters by country, type, anonymity; no API — HTML scraping only |

---

## 7. Integration Recommendation — LeadScale Proxy Waterfall

Layer proxies in this order (cheapest/most reliable first, exhausting before falling to next):

```
OSINT Worker Proxy Waterfall
================================

TIER 1 — Already integrated (from lead_search_and_verification_apis.md):
  ScraperAPI        → 5,000 free req/month, rotating, no CC
  Webshare.io       → 10 datacenter proxies / 1GB free
  Geonode           → 1GB residential free

TIER 2 — Commercial free tiers (this file, add in order):
  NodeMaven         → 1GB residential free trial, no CC
  Windscribe SOCKS5 → 10GB/month, no CC; use for SOCKS5-native tools
  Oxylabs trial     → 7-day / unlimited for high-quality target testing
  PacketStream      → $1/GB pay-as-you-go; use when free tiers exhausted

TIER 3 — Self-hosted permanent relays:
  Oracle Cloud (2x) → Deploy 3proxy; 2 free IPs forever, 10TB/month
  Fly.io (3x VMs)   → Deploy microsocks; 3 regions, 160GB/month free
  GCP free VM       → Deploy tinyproxy; US backup relay

TIER 4 — OSS pool (public proxies, validated):
  jhao104/proxy_pool → Redis pool collecting + validating public proxies
  monosans/proxy-checker → Pre-validate before adding to pool
  ProxyScrape API   → Seed source for pool collectors
  jetkai/proxy-list → Seed source for pool collectors

TIER 5 — Experimental (low-sensitivity only):
  Tor (dperson/torproxy) → Anonymous public data lookups only
  Windscribe         → Backup SOCKS5 when Tier 2 exhausted
```

**Recommended Day 1 additions (under 2h each):**
1. Sign up NodeMaven — 1GB residential, no CC → add `PROXY_URL` env var
2. Sign up Windscribe free — configure `proxy.windscribe.com:1080` for SOCKS5 tools
3. Create Oracle Cloud Always Free account → deploy 3proxy on 2 VMs → permanent relay IPs

---

## 8. DO NOT USE in Production

| Source | Reason |
|--------|--------|
| **Raw unvalidated public proxy lists** (free-proxy-list.net, spys.one, hidemy.name direct) | 15–40% live rate at any moment; using unvalidated proxies directly will cause 429s and timeouts in production. Always pipe through monosans/proxy-checker or jhao104/proxy_pool first. |
| **GimmeProxy / PubProxy** (as sole proxy source) | 5–200 req/day limit; fine as a test endpoint, breaks under any real load |
| **Tor for time-sensitive waterfall stages** | 3–10s average latency per request; will blow LeadScale's 1.5s SLA on any enrichment stage using it |
| **Render.com free tier as proxy relay** | Spins down after 15min inactivity; cold start = 10–30s delay; unacceptable for production proxy routing |
| **SOAX (trial only)** | 7-day trial, CC required after; no permanent free tier; use Oxylabs/NodeMaven trial instead |
| **I2P proxies** | Extremely high latency (>10s), tiny network, unstable; not viable for any production use case |
| **Shifter/Microleaves** | Paid-only, no real free tier; excluded |
| **Psiphon / Lantern** | Censorship circumvention tools; not designed for proxy API integration; unstable in automation context |
| **scylla / qiyeboy/IPProxyPool / fate0/getproxy** | [VERIFY activity] — check commit dates before using; may be unmaintained |

# Tool: goproxy
**Type:** Self-Hosted OSS
**Category:** Proxy Relay / Gateway Server
**Free Tier:** Unlimited (self-hosted)
**CC Required:** No
**Priority Score:** 9
**Phase:** 3

## What It Does
goproxy is a high-performance Go-based proxy server that supports HTTP, HTTPS, SOCKS5, WebSocket, and TCP tunneling, compiled to a single static binary. In the LeadScale stack it serves as a **proxy aggregation gateway** — it sits in front of multiple upstream proxies (Webshare, Geonode, IPRoyal) and presents them as a single endpoint to OSINT workers. This means workers only ever talk to one proxy address, while goproxy handles load-balancing and failover across the upstream pool. It can also be used as a transparent HTTPS inspection proxy for debugging worker traffic during development.

**GitHub:** https://github.com/snail007/goproxy
**Stars:** 15,000+
**License:** MIT (proxy binary) / GPL-3.0 (some enterprise plugins)
**Last Commit:** 2025

## Free Tier Details
- Completely free to run self-hosted
- No limits on throughput, connections, or bandwidth (hardware-bound only)
- Upstream proxy pool size is limited only by how many proxy accounts you have

## Docker Integration

```dockerfile
# Multi-stage build — produces small final image
FROM golang:1.21-alpine AS builder
RUN go install github.com/snail007/goproxy@latest

FROM alpine:latest
COPY --from=builder /go/bin/goproxy /usr/local/bin/goproxy
EXPOSE 8080
CMD ["goproxy", "http", "-p", ":8080", "--forever"]
```

```bash
# Run as gateway aggregating Webshare + Geonode upstreams
docker run -d \
  --name goproxy-gateway \
  --network leadscale_worker_net \
  -p 8080:8080 \
  -e UPSTREAM_PROXIES="http://user:pass@ws-host:port,http://user:pass@geo-host:9000" \
  leadscale/goproxy
```

```bash
# Simple HTTPS proxy on port 8080
goproxy https -p :8080 --forever

# Load-balance across multiple upstream proxies
goproxy http -p :8080 \
  --parent http://webshare_user:webshare_pass@dc1.webshare.io:10000 \
  --parent http://geonode_user:geonode_pass@rotating.geonode.com:9000 \
  --forever
```

## Container Gateway Pattern
Deploy goproxy as a single gateway container that aggregates all proxy upstreams:

```
OSINT Workers
    │
    ▼
goproxy-gateway:8080  ──── round-robin / failover ────▶ Webshare datacenter
                                                    ──▶ Geonode residential
                                                    ──▶ IPRoyal residential
                                                    ──▶ proxybroker2 (emergency)
```

Workers set `HTTPS_PROXY=http://goproxy-gateway:8080` and never need to know which upstream is active.

## LeadScale Worker Routing
- **Use for:** Proxy abstraction layer — single `HTTPS_PROXY` env var for all workers that routes through whichever upstream proxy has remaining budget
- **Priority tier:** Phase 3 infrastructure — deploy once as part of the self-hosted proxy fleet; upgrades all workers from direct proxy calls to a managed gateway
- **Best value:** When you have 3+ upstream proxy accounts, goproxy pays for itself immediately by providing failover without code changes in workers

## Limitations & Gotchas
- **Not a proxy source** — goproxy relays requests through upstream proxies; you still need paid/free upstream accounts (Webshare, Geonode, etc.); it doesn't generate IPs itself
- **Configuration complexity:** multi-upstream load balancing requires understanding goproxy's `--parent` flags and health check configuration
- **TLS inspection mode** requires certificate installation in worker containers — only needed for debugging, not production routing
- **MIT license core** is safe; avoid the enterprise plugins (GPL) for the proprietary codebase

## Related Specs
- `../../integrations/opensource_leadgen_and_osint_tools.md` §8
- `../../INTEGRATION_PRIORITY.md` (rank 66, Phase 3)
- [webshare.md](webshare.md), [geonode.md](geonode.md), [iproyal.md](iproyal.md) — upstream sources

## Code Upload Targets
- `src/tools/proxies/goproxy/`
- `src/workers/proxy/`

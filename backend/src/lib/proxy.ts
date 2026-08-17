import { ProxyAgent, fetch as undiciFetch } from 'undici'
import { config } from '../config.js'

// ─── Proxy pool entry types ────────────────────────────────────────────────

type ProxyType = 'webshare' | 'geonode' | 'iproyal' | 'nodemaven' | 'windscribe' | 'goproxy' | 'public'

interface ProxyEntry {
  url: string
  type: ProxyType
}

// ─── Module state ──────────────────────────────────────────────────────────

let proxyPool: ProxyEntry[] = []
let roundRobinIdx = 0

// ─── Helpers ───────────────────────────────────────────────────────────────

function parseUserPassHostPort(
  list: string,
  type: ProxyType,
  protocol = 'http',
): ProxyEntry[] {
  return list
    .split(',')
    .map((e) => e.trim().split(':'))
    .filter((p) => p.length === 4 && p.every(Boolean))
    .map(([host, port, user, pass]) => ({
      url: `${protocol}://${user}:${pass}@${host}:${port}`,
      type,
    }))
}

async function fetchTextProxyList(url: string, type: ProxyType, limit = 30): Promise<ProxyEntry[]> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
    const text = await res.text()
    return text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => /^[^\s:]+:\d+$/.test(l))
      .slice(0, limit)
      .map((hostPort) => ({ url: `http://${hostPort}`, type }))
  } catch {
    return []
  }
}

// ─── Public seed list URLs (TheSpeedX + ProxyScrape) ──────────────────────

const PUBLIC_LIST_URLS = [
  'https://api.proxyscrape.com/v3/free-proxy-list/get?request=displayproxies&protocol=http&timeout=5000',
  'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt',
  'https://www.proxy-list.download/api/v1/get?type=https',
  'https://raw.githubusercontent.com/mertguvencli/http-proxy-list/main/proxy-list/data.txt',
  'https://raw.githubusercontent.com/roosterkid/openproxylist/main/HTTPS_RAW.txt',
  'https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-http.txt',
  'https://openproxy.space/list/http',
]

// ─── initProxyPool ─────────────────────────────────────────────────────────

export async function initProxyPool(): Promise<void> {
  const p = config.proxy

  // Tier 1 — Webshare datacenter (host:port:user:pass CSV)
  if (p.webshareProxyList) {
    proxyPool.push(...parseUserPassHostPort(p.webshareProxyList, 'webshare'))
  }

  // Tier 2 — Geonode residential rotating endpoint
  if (p.geonodeUsername && p.geonodePassword) {
    proxyPool.push({
      url: `http://${p.geonodeUsername}:${p.geonodePassword}@${p.geonodeHost}:${p.geonodePort}`,
      type: 'geonode',
    })
  }

  // Tier 2 — IPRoyal residential rotating endpoint
  if (p.iproyalUsername && p.iproyalPassword) {
    proxyPool.push({
      url: `http://${p.iproyalUsername}:${p.iproyalPassword}@${p.iproyalHost}:${p.iproyalPort}`,
      type: 'iproyal',
    })
  }

  // Tier 2 — NodeMaven residential rotating endpoint (same user:pass@host:port format)
  if (p.nodemaven) {
    proxyPool.push(...parseUserPassHostPort(p.nodemaven, 'nodemaven'))
  }

  // Tier 3 — Windscribe SOCKS5 (10 GB/mo free)
  if (p.windscribeUsername && p.windscribePassword) {
    proxyPool.push({
      url: `socks5://${p.windscribeUsername}:${p.windscribePassword}@proxy.windscribe.com:1080`,
      type: 'windscribe',
    })
  }

  // Tier 4 — Public seed lists (only when no managed proxies AND no ScraperAPI)
  const hasManagedProxy = proxyPool.length > 0 || !!config.enrichment.scraperApiKey
  const hasApiProxy = !!p.scrapingbeeApiKey || !!p.zenrowsApiKey || !!p.crawlbaseApiToken

  if (!hasManagedProxy && !hasApiProxy) {
    // Fetch from multiple seed sources concurrently, take first 10 from each, cap total at 50
    const results = await Promise.all(
      PUBLIC_LIST_URLS.map((url) => fetchTextProxyList(url, 'public', 10)),
    )
    const deduped = new Map<string, ProxyEntry>()
    for (const batch of results) {
      for (const entry of batch) {
        if (!deduped.has(entry.url)) deduped.set(entry.url, entry)
        if (deduped.size >= 50) break
      }
    }
    // PubProxy — returns plain text "IP:PORT\n" for limit=5
    try {
      const r = await fetch('https://pubproxy.com/api/proxy?limit=5&format=txt', {
        signal: AbortSignal.timeout(8000),
      })
      const txt = await r.text()
      txt.split('\n').map((l) => l.trim()).filter((l) => /^[^\s:]+:\d+$/.test(l)).slice(0, 5).forEach((hp) => {
        if (!deduped.has('http://' + hp)) deduped.set('http://' + hp, { url: 'http://' + hp, type: 'public' })
      })
    } catch {}

    // GimmeProxy — returns JSON {"curl": "ip:port", ...}
    try {
      const r = await fetch('https://gimmeproxy.com/api/getProxy', {
        signal: AbortSignal.timeout(8000),
      })
      const j = await r.json() as { curl?: string }
      if (j.curl && /^[^\s:]+:\d+$/.test(j.curl) && !deduped.has('http://' + j.curl)) {
        deduped.set('http://' + j.curl, { url: 'http://' + j.curl, type: 'public' })
      }
    } catch {}

    proxyPool.push(...deduped.values())
  }

  const stats = getProxyStats()
  console.log(
    `[proxy] pool ready — scraperApi=${stats.scraperApi} scrapingbee=${stats.scrapingbee}` +
    ` zenrows=${stats.zenrows} crawlbase=${stats.crawlbase}` +
    ` proxybroker=${stats.proxybroker}` +
    ` webshare=${stats.webshare} geonode=${stats.geonode} iproyal=${stats.iproyal}` +
    ` nodemaven=${stats.nodemaven} windscribe=${stats.windscribe} public=${stats.public}`,
  )
}

// ─── proxiedFetch — full waterfall ─────────────────────────────────────────

export async function proxiedFetch(
  targetUrl: string,
  init?: RequestInit,
  opts?: { renderJs?: boolean; antiBot?: boolean },
): Promise<Response> {
  const p = config.proxy
  const method = (init?.method ?? 'GET') as string

  // ── Priority 1: ScraperAPI (5K req/mo free, rotating, handles JS) ────────
  if (config.enrichment.scraperApiKey) {
    const apiUrl =
      `https://api.scraperapi.com/?api_key=${config.enrichment.scraperApiKey}` +
      `&url=${encodeURIComponent(targetUrl)}` +
      (opts?.renderJs ? '&render=true' : '')
    const res = await fetch(apiUrl, { ...init, method })
    if (res.status === 403) {
      const body = await res.text()
      if (body.includes('limit_reached')) {
        console.warn('[proxy] ScraperAPI limit reached — falling through')
      } else {
        return new Response(body, { status: 403, headers: Object.fromEntries(res.headers) })
      }
    } else {
      return res
    }
  }

  // ── Priority 2: Zenrows (anti-bot specialist, 1K/mo free) ─────────────────
  if (opts?.antiBot && p.zenrowsApiKey) {
    const apiUrl =
      `https://api.zenrows.com/v1/?apikey=${p.zenrowsApiKey}` +
      `&url=${encodeURIComponent(targetUrl)}` +
      `&antibot=true` +
      (opts?.renderJs ? '&js_render=true' : '')
    const res = await fetch(apiUrl, { ...init, method })
    if (res.status !== 422) return res
    console.warn('[proxy] Zenrows credits exhausted — falling through')
  }

  // ── Priority 3: ScrapingBee (JS rendering, 1K/mo free) ───────────────────
  if (opts?.renderJs && p.scrapingbeeApiKey) {
    const apiUrl =
      `https://app.scrapingbee.com/api/v1/?api_key=${p.scrapingbeeApiKey}` +
      `&render_js=true&url=${encodeURIComponent(targetUrl)}`
    const res = await fetch(apiUrl, { ...init, method })
    if (res.status !== 500) return res
    const body = await res.text()
    if (body.includes('No credits left')) {
      console.warn('[proxy] ScrapingBee credits exhausted — falling through')
    } else {
      return new Response(body, { status: 500 })
    }
  }

  // ── Priority 4: Crawlbase (1K/mo free, async-friendly) ───────────────────
  if (p.crawlbaseApiToken) {
    const apiUrl =
      `https://api.crawlbase.com/?token=${p.crawlbaseApiToken}` +
      `&url=${encodeURIComponent(targetUrl)}` +
      (opts?.renderJs ? '&renderJS=true' : '')
    const res = await fetch(apiUrl, { ...init, method })
    if (res.status !== 429) return res
    console.warn('[proxy] Crawlbase credits exhausted — falling through')
  }

  // ── Priority 5: proxybroker2 local sidecar (Phase 3 validated pool) ───────
  if (p.proxybrokerUrl) {
    try {
      const agent = new ProxyAgent(p.proxybrokerUrl)
      return (await undiciFetch(targetUrl, { ...init, dispatcher: agent } as any)) as unknown as Response
    } catch {
      console.warn('[proxy] proxybroker2 sidecar unavailable — falling through')
    }
  }

  // ── Priority 6: proxyPool round-robin (webshare/geonode/iproyal/nodemaven/windscribe/public)
  // Priority 5b: goproxy gateway
  if (p.goproxyUrl) {
    try {
      const agent = new ProxyAgent(p.goproxyUrl)
      return (await undiciFetch(targetUrl, { ...init, dispatcher: agent } as any)) as unknown as Response
    } catch {
      console.warn('[proxy] goproxy gateway unavailable — falling through')
    }
  }

  if (proxyPool.length > 0) {
    for (let attempt = 0; attempt < Math.min(3, proxyPool.length); attempt++) {
      const entry = proxyPool[roundRobinIdx++ % proxyPool.length]
      try {
        const agent = new ProxyAgent(entry.url)
        return (await undiciFetch(targetUrl, { ...init, dispatcher: agent } as any)) as unknown as Response
      } catch {
        // try next proxy
      }
    }
  }

  // ── Priority 7: direct (no proxy) ─────────────────────────────────────────
  return fetch(targetUrl, init)
}

// ─── Stats & helpers ───────────────────────────────────────────────────────

export function getProxyCount(): number {
  return proxyPool.length
}

export function getProxyStats() {
  const p = config.proxy
  return {
    scraperApi:    !!config.enrichment.scraperApiKey,
    scrapingbee:   !!p.scrapingbeeApiKey,
    zenrows:       !!p.zenrowsApiKey,
    crawlbase:     !!p.crawlbaseApiToken,
    proxybroker:   !!p.proxybrokerUrl,
    goproxy:       p.goproxyUrl ? 1 : 0,
    webshare:      proxyPool.filter((x) => x.type === 'webshare').length,
    geonode:       proxyPool.filter((x) => x.type === 'geonode').length,
    iproyal:       proxyPool.filter((x) => x.type === 'iproyal').length,
    nodemaven:     proxyPool.filter((x) => x.type === 'nodemaven').length,
    windscribe:    proxyPool.filter((x) => x.type === 'windscribe').length,
    public:        proxyPool.filter((x) => x.type === 'public').length,
  }
}

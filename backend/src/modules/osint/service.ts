import { getCache, setCache } from '../../lib/redis.js'
import { runHarvester } from './workers/harvester.js'
import { crawlWebsite } from './workers/crawl4ai.js'
import { googleMapsSearch, type MapsResult } from './workers/serper.js'

const CACHE_TTL = 86400 // 24 hours

export interface OsintResult {
  domain: string
  emails: string[]
  phones: string[]
  maps_results: MapsResult[]
  source: string
  cached: boolean
}

export async function runOsintPipeline(
  domain: string,
  opts: { scraperApiKey?: string; serperApiKey?: string; mapsQuery?: string; mapsLocation?: string },
): Promise<OsintResult> {
  const cacheKey = `osint:${domain}`
  const cached = await getCache<OsintResult>(cacheKey)
  if (cached) return { ...cached, cached: true }

  const [crawl, harvest, maps] = await Promise.allSettled([
    crawlWebsite(`https://${domain}`, opts.scraperApiKey),
    runHarvester(domain),
    opts.serperApiKey && opts.mapsQuery
      ? googleMapsSearch(opts.mapsQuery, opts.mapsLocation ?? '', opts.serperApiKey)
      : Promise.resolve([]),
  ])

  const crawlData = crawl.status === 'fulfilled' ? crawl.value : { emails: [], phones: [] }
  const harvestData = harvest.status === 'fulfilled' ? harvest.value : { emails: [] }
  const mapsData = maps.status === 'fulfilled' ? (maps.value as MapsResult[]) : []

  const emailSet = new Set<string>([
    ...crawlData.emails,
    ...harvestData.emails,
    ...mapsData.map((m) => '').filter(Boolean),
  ])
  emailSet.delete('')

  const result: OsintResult = {
    domain,
    emails: [...emailSet],
    phones: crawlData.phones ?? [],
    maps_results: mapsData,
    source: 'osint',
    cached: false,
  }

  await setCache(cacheKey, result, CACHE_TTL)
  return result
}

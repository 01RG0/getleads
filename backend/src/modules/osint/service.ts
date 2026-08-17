import { getCache, setCache } from '../../lib/redis.js'
import { runHarvester } from './workers/harvester.js'
import { crawlWebsite } from './workers/crawl4ai.js'
import { enumerateCompanyEmails } from './workers/crosslinked.js'
import { checkSocialPresence, type HoleheResult } from './workers/holehe.js'
import { googleMapsSearch, type MapsResult } from './workers/serper.js'

const CACHE_TTL = 86400 // 24 hours

export interface OsintResult {
  domain: string
  emails: string[]
  phones: string[]
  maps_results: MapsResult[]
  social_presence: Record<string, HoleheResult | null>
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

  const [crawl, harvest, maps, crosslinked] = await Promise.allSettled([
    crawlWebsite(`https://${domain}`, opts.scraperApiKey),
    runHarvester(domain),
    opts.serperApiKey && opts.mapsQuery
      ? googleMapsSearch(opts.mapsQuery, opts.mapsLocation ?? '', opts.serperApiKey)
      : Promise.resolve([]),
    enumerateCompanyEmails(domain, domain),
  ])

  const crawlData = crawl.status === 'fulfilled' ? crawl.value : { emails: [], phones: [] }
  const harvestData = harvest.status === 'fulfilled' ? harvest.value : { emails: [] }
  const mapsData = maps.status === 'fulfilled' ? (maps.value as MapsResult[]) : []
  const crosslinkedData = crosslinked.status === 'fulfilled' && crosslinked.value ? crosslinked.value : { emails: [] }

  const emailSet = new Set<string>([
    ...crawlData.emails,
    ...harvestData.emails,
    ...crosslinkedData.emails,
  ])
  emailSet.delete('')

  const emails = [...emailSet]
  const socialPresenceEntries = await Promise.all(
    emails.slice(0, 3).map(async (email) => [email, await checkSocialPresence(email)] as const),
  )
  const socialPresence = Object.fromEntries(socialPresenceEntries) as Record<string, HoleheResult | null>

  const result: OsintResult = {
    domain,
    emails,
    phones: [...new Set([...(crawlData.phones ?? []), ...mapsData.map((m: any) => m.phone).filter(Boolean)])],
    maps_results: mapsData,
    social_presence: socialPresence,
    source: 'osint',
    cached: false,
  }

  await setCache(cacheKey, result, CACHE_TTL)
  return result
}

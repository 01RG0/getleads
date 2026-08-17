import type { CompanyData } from './base.js'

interface EdgarHit {
  _source?: {
    display_date_filed?: string
    entity_name?: string
    file_num?: string
    period_of_report?: string
    state_of_inc?: string
    sic_description?: string
  }
}

interface GleifHit {
  suggestion?: string
  legal_name?: string
  country?: string
}

interface RdapResult {
  ldhName?: string
  entities?: Array<{
    vcardArray?: unknown[][]
    roles?: string[]
  }>
}

async function tryEdgar(companyName: string): Promise<Partial<CompanyData>> {
  try {
    const encoded = encodeURIComponent(`"${companyName}"`)
    const url = `https://efts.sec.gov/LATEST/search-index?q=${encoded}&dateRange=custom&startdt=2020-01-01`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'LeadScale enrichment@leadscale.io' },
    })
    if (!res.ok) return {}

    const data = await res.json() as { hits?: { hits?: EdgarHit[] } }
    const hit = data.hits?.hits?.[0]?._source
    if (!hit) return {}

    return {
      name: hit.entity_name ?? companyName,
      industry: hit.sic_description,
      country: hit.state_of_inc ? 'United States' : undefined,
    }
  } catch {
    return {}
  }
}

async function tryGleif(companyName: string): Promise<Partial<CompanyData>> {
  try {
    const encoded = encodeURIComponent(companyName)
    const url = `https://api.gleif.org/api/v1/fuzzycompletions?field=entity.legalName&q=${encoded}`
    const res = await fetch(url)
    if (!res.ok) return {}

    const data = await res.json() as { data?: GleifHit[] }
    const hit = data.data?.[0]
    if (!hit) return {}

    return {
      name: hit.legal_name ?? hit.suggestion ?? companyName,
      country: hit.country,
    }
  } catch {
    return {}
  }
}

async function tryRdap(domain: string): Promise<Partial<CompanyData>> {
  try {
    const apex = domain.replace(/^www\./, '')
    const url = `https://rdap.org/domain/${encodeURIComponent(apex)}`
    const res = await fetch(url, {
      headers: { Accept: 'application/rdap+json' },
    })
    if (!res.ok) return {}

    const data = await res.json() as RdapResult
    if (!data.ldhName) return {}

    return { domain: apex }
  } catch {
    return {}
  }
}

export async function enrichCompany(domain: string, companyName: string): Promise<CompanyData> {
  const [edgarData, gleifData, rdapData] = await Promise.allSettled([
    tryEdgar(companyName),
    tryGleif(companyName),
    tryRdap(domain),
  ])

  const edgar = edgarData.status === 'fulfilled' ? edgarData.value : {}
  const gleif = gleifData.status === 'fulfilled' ? gleifData.value : {}
  const rdap = rdapData.status === 'fulfilled' ? rdapData.value : {}

  // Merge: edgar > gleif > rdap, with explicit params as fallback
  return {
    name: edgar.name ?? gleif.name ?? companyName,
    domain: rdap.domain ?? domain,
    industry: edgar.industry ?? gleif.industry,
    country: edgar.country ?? gleif.country ?? rdap.country,
    city: edgar.city ?? gleif.city,
    revenueRange: edgar.revenueRange ?? gleif.revenueRange,
    technographics: [],
  }
}

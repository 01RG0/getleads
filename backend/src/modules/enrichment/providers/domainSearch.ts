import { config } from '../../../config.js'
import { getBreaker } from '../../../lib/circuit-breaker.js'

export interface DomainEmailResult {
  email: string
  firstName?: string
  lastName?: string
  position?: string
  confidence: number
  sources?: string[]
}

async function domainSearchHunter(domain: string, limit: number, apiKey: string): Promise<DomainEmailResult[]> {
  return getBreaker('hunter-domain', { requestTimeoutMs: 10000 }).execute(async () => {
    const url = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${apiKey}&limit=${limit}`
    const res = await fetch(url)
    if (!res.ok) return []
    const json = await res.json() as { data?: { emails?: Array<{ value: string; first_name?: string; last_name?: string; position?: string; confidence?: number; sources?: Array<{ domain: string }> }> } }
    return (json.data?.emails ?? []).map((e) => ({
      email: e.value,
      firstName: e.first_name,
      lastName: e.last_name,
      position: e.position,
      confidence: (e.confidence ?? 0) / 100,
      sources: e.sources?.map((s) => s.domain),
    }))
  }).catch(() => [])
}

export async function domainSearch(domain: string, limit: number): Promise<DomainEmailResult[]> {
  if (config.enrichment.huntApiKey) {
    const results = await domainSearchHunter(domain, limit, config.enrichment.huntApiKey)
    if (results.length > 0) return results
  }
  return []
}

export async function domainEmailCount(domain: string): Promise<{ total: number; personalEmails: number; genericEmails: number } | null> {
  if (!config.enrichment.huntApiKey) return null
  return getBreaker('hunter-count', { requestTimeoutMs: 8000 }).execute(async () => {
    const url = `https://api.hunter.io/v2/email-count?domain=${encodeURIComponent(domain)}&api_key=${config.enrichment.huntApiKey}`
    const res = await fetch(url)
    if (!res.ok) return null
    const json = await res.json() as { data?: { total?: number; personal_emails?: number; generic_emails?: number } }
    return { total: json.data?.total ?? 0, personalEmails: json.data?.personal_emails ?? 0, genericEmails: json.data?.generic_emails ?? 0 }
  }).catch(() => null)
}

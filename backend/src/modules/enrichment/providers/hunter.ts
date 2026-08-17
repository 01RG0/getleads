import { getBreaker } from '../../../lib/circuit-breaker.js'
import { config } from '../../../config.js'
import type { EnrichmentParams, EnrichmentResult } from './base.js'

export async function hunterEnrich(params: EnrichmentParams): Promise<EnrichmentResult | null> {
  if (!config.enrichment.huntApiKey) return null
  try {
    const url = new URL('https://api.hunter.io/v2/email-finder')
    url.searchParams.set('domain', params.domain)
    url.searchParams.set('first_name', params.firstName)
    url.searchParams.set('last_name', params.lastName)
    url.searchParams.set('api_key', config.enrichment.huntApiKey)
    const result = await getBreaker('hunter', { requestTimeoutMs: 8000 }).execute(() => fetch(url.toString()))
    if (!result.ok) return null
    const data = (await result.json()) as { data?: { email?: string; score?: number } }
    if (!data.data?.email) return null
    return {
      email: data.data.email,
      firstName: params.firstName,
      lastName: params.lastName,
      dataSource: 'hunter',
      confidence: (data.data.score ?? 50) / 100,
    }
  } catch {
    return null
  }
}

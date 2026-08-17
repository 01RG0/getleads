import { getBreaker } from '../../../lib/circuit-breaker.js'
import { config } from '../../../config.js'
import type { EnrichmentParams, EnrichmentResult } from './base.js'

export async function prospeoEnrich(params: EnrichmentParams): Promise<EnrichmentResult | null> {
  if (!config.enrichment.prospeoApiKey) return null
  try {
    const result = await getBreaker('prospeo', { requestTimeoutMs: 8000 }).execute(() =>
      fetch('https://api.prospeo.io/email-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-KEY': config.enrichment.prospeoApiKey! },
        body: JSON.stringify({ first_name: params.firstName, last_name: params.lastName, domain: params.domain }),
      }),
    )
    if (!result.ok) return null
    const data = (await result.json()) as { response?: { email?: string } }
    if (!data.response?.email) return null
    return {
      email: data.response.email,
      firstName: params.firstName,
      lastName: params.lastName,
      dataSource: 'prospeo',
      confidence: 0.85,
    }
  } catch {
    return null
  }
}

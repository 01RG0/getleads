import { getBreaker } from '../../../lib/circuit-breaker.js'
import { config } from '../../../config.js'
import type { EnrichmentParams, EnrichmentResult } from './base.js'

export async function findymailEnrich(params: EnrichmentParams): Promise<EnrichmentResult | null> {
  if (!config.enrichment.findymailApiKey) return null
  try {
    const result = await getBreaker('findymail', { requestTimeoutMs: 8000 }).execute(() =>
      fetch('https://app.findymail.com/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.enrichment.findymailApiKey}`,
        },
        body: JSON.stringify({ name: `${params.firstName} ${params.lastName}`, domain: params.domain }),
      }),
    )
    if (!result.ok) return null
    const data = (await result.json()) as { email?: string }
    if (!data.email) return null
    return {
      email: data.email,
      firstName: params.firstName,
      lastName: params.lastName,
      dataSource: 'findymail',
      confidence: 0.80,
    }
  } catch {
    return null
  }
}

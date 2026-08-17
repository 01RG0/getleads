import { getBreaker } from '../../../lib/circuit-breaker.js'
import { config } from '../../../config.js'
import type { EnrichmentParams, EnrichmentResult } from './base.js'

export async function dropcontactEnrich(params: EnrichmentParams): Promise<EnrichmentResult | null> {
  if (!config.enrichment.dropcontactApiKey) return null
  try {
    const result = await getBreaker('dropcontact', { requestTimeoutMs: 15000 }).execute(() =>
      fetch('https://api.dropcontact.io/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Token': config.enrichment.dropcontactApiKey!,
        },
        body: JSON.stringify({
          data: [{ first_name: params.firstName, last_name: params.lastName, website: params.domain }],
          siren: false,
        }),
      }),
    )
    if (!result.ok) return null
    const data = (await result.json()) as { data?: Array<{ email?: Array<{ email?: string }> }> }
    const email = data.data?.[0]?.email?.[0]?.email
    if (!email) return null
    return {
      email,
      firstName: params.firstName,
      lastName: params.lastName,
      dataSource: 'dropcontact',
      confidence: 0.85,
    }
  } catch {
    return null
  }
}

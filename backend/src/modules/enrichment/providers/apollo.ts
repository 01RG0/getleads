import { getBreaker } from '../../../lib/circuit-breaker.js'
import { config } from '../../../config.js'
import type { EnrichmentParams, EnrichmentResult } from './base.js'

export async function apolloEnrich(params: EnrichmentParams): Promise<EnrichmentResult | null> {
  if (!config.enrichment.apolloApiKey) return null
  try {
    const result = await getBreaker('apollo', { requestTimeoutMs: 10000 }).execute(() =>
      fetch('https://api.apollo.io/v1/people/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Api-Key': config.enrichment.apolloApiKey! },
        body: JSON.stringify({ first_name: params.firstName, last_name: params.lastName, domain: params.domain }),
      }),
    )
    if (!result.ok) return null
    const data = (await result.json()) as { person?: { email?: string; title?: string; linkedin_url?: string } }
    if (!data.person?.email) return null
    return {
      email: data.person.email,
      firstName: params.firstName,
      lastName: params.lastName,
      jobTitle: data.person.title,
      linkedinUrl: data.person.linkedin_url,
      dataSource: 'apollo',
      confidence: 0.90,
    }
  } catch {
    return null
  }
}

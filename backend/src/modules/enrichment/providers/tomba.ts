import { getBreaker } from '../../../lib/circuit-breaker.js'
import { config } from '../../../config.js'
import type { EnrichmentParams, EnrichmentResult } from './base.js'

export async function tombaEnrich(params: EnrichmentParams): Promise<EnrichmentResult | null> {
  const { tombaApiKey } = config.enrichment
  if (!tombaApiKey) return null

  try {
    const { domain, firstName, lastName } = params
    const url = `https://api.tomba.io/v1/email-finder/${encodeURIComponent(domain)}/${encodeURIComponent(firstName)}/${encodeURIComponent(lastName)}`

    const res = await getBreaker('tomba', { requestTimeoutMs: 8000 }).execute(() =>
      fetch(url, {
        headers: {
          'X-Tannin-Key': tombaApiKey,
          'Content-Type': 'application/json',
        },
      }),
    )

    if (!res.ok) return null

    const data = await res.json() as {
      data?: {
        email?: string
        first_name?: string
        last_name?: string
        position?: string
        phone_number?: string
        linkedin?: string
        score?: number
        company?: {
          name?: string
          domain?: string
          country?: string
          city?: string
          industry?: string
          size?: string
        }
      }
    }

    const hit = data.data
    if (!hit?.email) return null

    return {
      email: hit.email,
      firstName: hit.first_name ?? firstName,
      lastName: hit.last_name ?? lastName,
      jobTitle: hit.position,
      phone: hit.phone_number,
      linkedinUrl: hit.linkedin,
      company: {
        name: hit.company?.name ?? params.companyName,
        domain: hit.company?.domain ?? domain,
        country: hit.company?.country,
        city: hit.company?.city,
        industry: hit.company?.industry,
      },
      dataSource: 'tomba.io',
      confidence: typeof hit.score === 'number' ? hit.score / 100 : 0.7,
    }
  } catch {
    return null
  }
}

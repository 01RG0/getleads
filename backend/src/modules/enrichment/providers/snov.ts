import { config } from '../../../config.js'
import { getCache, setCache } from '../../../lib/redis.js'
import type { EnrichmentParams, EnrichmentResult } from './base.js'

const SNOV_TOKEN_CACHE_KEY = 'snov:access_token'
const SNOV_TOKEN_TTL = 3600

async function getSnovAccessToken(): Promise<string | null> {
  const { snovApiUser, snovApiSecret } = config.enrichment
  if (!snovApiUser || !snovApiSecret) return null

  const cached = await getCache<string>(SNOV_TOKEN_CACHE_KEY)
  if (cached) return cached

  const res = await fetch('https://api.snov.io/v1/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: snovApiUser,
      client_secret: snovApiSecret,
    }),
  })

  if (!res.ok) return null

  const data = await res.json() as { access_token?: string }
  if (!data.access_token) return null

  await setCache(SNOV_TOKEN_CACHE_KEY, data.access_token, SNOV_TOKEN_TTL)
  return data.access_token
}

export async function snovEnrich(params: EnrichmentParams): Promise<EnrichmentResult | null> {
  try {
    const token = await getSnovAccessToken()
    if (!token) return null

    const res = await fetch('https://api.snov.io/v2/domain-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: token,
        domain: params.domain,
        first_name: params.firstName,
        last_name: params.lastName,
        limit: 1,
      }),
    })

    if (!res.ok) return null

    const data = await res.json() as {
      data?: Array<{
        email?: string
        firstName?: string
        lastName?: string
        position?: string
        linkedInUrl?: string
        confidence?: number
      }>
    }

    const hit = data.data?.[0]
    if (!hit?.email) return null

    return {
      email: hit.email,
      firstName: hit.firstName ?? params.firstName,
      lastName: hit.lastName ?? params.lastName,
      jobTitle: hit.position,
      linkedinUrl: hit.linkedInUrl,
      company: { domain: params.domain, name: params.companyName },
      dataSource: 'snov.io',
      confidence: typeof hit.confidence === 'number' ? hit.confidence / 100 : 0.8,
    }
  } catch {
    return null
  }
}

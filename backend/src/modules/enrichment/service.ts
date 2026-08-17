import { prisma } from '../../lib/db.js'
import { getCache, setCache } from '../../lib/redis.js'
import type { EnrichmentResult } from './providers/base.js'
import { enrichCompany } from './providers/firmographic.js'
import { pdlEnrich } from './providers/pdl.js'
import { snovEnrich } from './providers/snov.js'
import { tombaEnrich } from './providers/tomba.js'

const CACHE_TTL = 14 * 24 * 60 * 60 // 14 days in seconds

export interface WaterfallParams {
  firstName: string
  lastName: string
  domain: string
  companyName?: string
  workspaceId: string
}

export interface WaterfallEnrichResult {
  result: EnrichmentResult
  tier: number
  cached: boolean
}

function cacheKey(firstName: string, lastName: string, domain: string): string {
  return `enrich:${firstName.toLowerCase()}:${lastName.toLowerCase()}:${domain.toLowerCase()}`
}

async function upsertContactAndCompany(
  result: EnrichmentResult,
  params: WaterfallParams,
): Promise<void> {
  try {
    let companyId: string | undefined

    if (params.domain) {
      const companyData = result.company ?? {}
      const company = await prisma.company.upsert({
        where: { domain: params.domain },
        create: {
          domain: params.domain,
          name: companyData.name ?? params.companyName ?? params.domain,
          employeeCount: companyData.employeeCount,
          industry: companyData.industry,
          country: companyData.country,
          city: companyData.city,
          revenueRange: companyData.revenueRange,
          technographics: companyData.technographics ?? [],
        },
        update: {
          name: companyData.name ?? params.companyName ?? params.domain,
          ...(companyData.employeeCount !== undefined && { employeeCount: companyData.employeeCount }),
          ...(companyData.industry && { industry: companyData.industry }),
          ...(companyData.country && { country: companyData.country }),
          ...(companyData.city && { city: companyData.city }),
          ...(companyData.revenueRange && { revenueRange: companyData.revenueRange }),
          ...(companyData.technographics && { technographics: companyData.technographics }),
        },
        select: { id: true },
      })
      companyId = company.id
    }

    // Try to find an existing contact by email or name+company combo
    const existingContact = result.email
      ? await prisma.contact.findFirst({
          where: { email: result.email },
          select: { id: true },
        })
      : null

    const contactData = {
      firstName: result.firstName ?? params.firstName,
      lastName: result.lastName ?? params.lastName,
      jobTitle: result.jobTitle ?? 'Unknown',
      email: result.email,
      phone: result.phone,
      linkedinUrl: result.linkedinUrl,
      confidenceScore: result.confidence,
      ...(companyId && { companyId }),
    }

    if (existingContact) {
      await prisma.contact.update({
        where: { id: existingContact.id },
        data: contactData,
      })
    } else {
      await prisma.contact.create({ data: contactData })
    }
  } catch {
    // Non-fatal — waterfall result still returned to caller
  }
}

export async function waterfallEnrich(params: WaterfallParams): Promise<WaterfallEnrichResult> {
  const key = cacheKey(params.firstName, params.lastName, params.domain)

  // Tier 0: Redis cache
  const cached = await getCache<EnrichmentResult>(key)
  if (cached) {
    return { result: cached, tier: 0, cached: true }
  }

  const enrichParams = {
    firstName: params.firstName,
    lastName: params.lastName,
    domain: params.domain,
    companyName: params.companyName,
  }

  const providers: Array<() => Promise<EnrichmentResult | null>> = [
    () => snovEnrich(enrichParams),   // Tier 1
    () => pdlEnrich(enrichParams),    // Tier 2
    () => tombaEnrich(enrichParams),  // Tier 3
  ]

  for (let i = 0; i < providers.length; i++) {
    const result = await providers[i]()
    if (result) {
      await setCache(key, result, CACHE_TTL)
      await upsertContactAndCompany(result, params)
      return { result, tier: i + 1, cached: false }
    }
  }

  // Tier 4+: Firmographic fallback (no contact email found, but return company data)
  const companyData = await enrichCompany(params.domain, params.companyName ?? params.domain)
  const fallbackResult: EnrichmentResult = {
    firstName: params.firstName,
    lastName: params.lastName,
    company: companyData,
    dataSource: 'firmographic',
    confidence: 0.3,
  }

  await setCache(key, fallbackResult, CACHE_TTL)
  await upsertContactAndCompany(fallbackResult, params)

  return { result: fallbackResult, tier: 4, cached: false }
}

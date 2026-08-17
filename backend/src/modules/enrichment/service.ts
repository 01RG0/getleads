import { prisma } from '../../lib/db.js'
import { getCache, setCache } from '../../lib/redis.js'
import { config } from '../../config.js'
import type { EnrichmentResult } from './providers/base.js'
import { findDuplicate, mergeContactData } from './deduplication.js'
import { isSuppressed } from '../gdpr/service.js'
import { enrichCompany } from './providers/firmographic.js'
import { prospeoEnrich } from './providers/prospeo.js'
import { findymailEnrich } from './providers/findymail.js'
import { dropcontactEnrich } from './providers/dropcontact.js'
import { apolloEnrich } from './providers/apollo.js'
import { hunterEnrich } from './providers/hunter.js'
import { snovEnrich } from './providers/snov.js'
import { pdlEnrich } from './providers/pdl.js'
import { tombaEnrich } from './providers/tomba.js'
import { verifyEmail } from '../verification/service.js'

const CACHE_TTL = 14 * 24 * 60 * 60 // 14 days in seconds

export interface WaterfallParams {
  firstName: string
  lastName: string
  domain: string
  companyName?: string
  linkedinUrl?: string
  includePhone?: boolean
  forceReverify?: boolean
  workspaceId: string
}

export interface WaterfallEnrichResult {
  result: EnrichmentResult
  tier: number
  cached: boolean
}

export function buildCacheKey(firstName: string, lastName: string, domain: string): string {
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

    // GDPR suppression check — skip DB write for suppressed emails
    if (result.email && await isSuppressed(params.workspaceId, result.email)) return

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

    // Deduplicate: SHA-256 email exact match, then fuzzy name+domain
    const existingContact = await findDuplicate(result.email, params.firstName, params.lastName, params.domain)

    if (existingContact) {
      await mergeContactData(existingContact.id, contactData)
    } else {
      await prisma.contact.create({ data: contactData })
    }
  } catch {
    // Non-fatal — waterfall result still returned to caller
  }
}

export async function waterfallEnrich(params: WaterfallParams): Promise<WaterfallEnrichResult> {
  const key = buildCacheKey(params.firstName, params.lastName, params.domain)

  // forceReverify: bust cache before checking
  if (params.forceReverify) {
    const { deleteCache } = await import('../../lib/redis.js')
    await deleteCache(key)
  }

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
    linkedinUrl: params.linkedinUrl,
  }

  const providers: Array<() => Promise<EnrichmentResult | null>> = [
    () => prospeoEnrich(enrichParams),    // Tier 1
    () => findymailEnrich(enrichParams),  // Tier 2
    () => dropcontactEnrich(enrichParams), // Tier 3
    () => apolloEnrich(enrichParams),     // Tier 4
    () => hunterEnrich(enrichParams),     // Tier 5
    () => snovEnrich(enrichParams),       // Tier 6
    () => pdlEnrich(enrichParams),        // Tier 7
    () => tombaEnrich(enrichParams),      // Tier 8
  ]

  const verificationApiKeys = {
    mailcheck: config.enrichment.mailcheckApiKey || undefined,
    zerobounce: config.enrichment.zerobounceApiKey || undefined,
    millionverifier: config.enrichment.millionverifierApiKey || undefined,
    abstractapi: config.enrichment.abstractapiEmailKey || undefined,
    neverbounce: config.enrichment.neverbouncApiKey || undefined,
    truemailHost: config.enrichment.truemailHost || undefined,
    truemailToken: config.enrichment.truemailToken || undefined,
  }

  for (let i = 0; i < providers.length; i++) {
    const result = await providers[i]()
    if (result?.email) {
      // Verify before caching — skip invalid emails
      const vResult = await verifyEmail(result.email, verificationApiKeys).catch(() => null)
      if (vResult && vResult.status === 'INVALID') continue
      await setCache(key, result, CACHE_TTL)
      await upsertContactAndCompany(result, params)
      return { result, tier: i + 1, cached: false }
    } else if (result) {
      // Provider returned data without email (company-only)
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

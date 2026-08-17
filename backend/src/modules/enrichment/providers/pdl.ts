import { config } from '../../../config.js'
import type { CompanyData, EnrichmentParams, EnrichmentResult } from './base.js'

const PDL_PERSON_URL = 'https://api.peopledatalabs.com/v5/person/enrich'
const PDL_COMPANY_URL = 'https://api.peopledatalabs.com/v5/company/enrich'

export async function pdlEnrich(params: EnrichmentParams): Promise<EnrichmentResult | null> {
  const { pdlApiKey } = config.enrichment
  if (!pdlApiKey) return null

  try {
    const body: Record<string, string> = {
      first_name: params.firstName,
      last_name: params.lastName,
    }
    if (params.companyName) body.company = params.companyName
    if (params.domain) body.company_domain = params.domain

    const res = await fetch(PDL_PERSON_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': pdlApiKey,
      },
      body: JSON.stringify({
        params: body,
        required: 'emails',
      }),
    })

    if (!res.ok) return null

    const data = await res.json() as {
      status?: number
      data?: {
        emails?: Array<{ address?: string }>
        first_name?: string
        last_name?: string
        job_title?: string
        phone_numbers?: string[]
        linkedin_url?: string
        job_company_name?: string
        job_company_website?: string
        job_company_size?: string
        job_company_industry?: string
        location_country?: string
        location_locality?: string
        job_company_employee_count?: number
      }
      likelihood?: number
    }

    if (data.status !== 200 || !data.data) return null

    const person = data.data
    const email = person.emails?.[0]?.address
    if (!email) return null

    return {
      email,
      firstName: person.first_name ?? params.firstName,
      lastName: person.last_name ?? params.lastName,
      jobTitle: person.job_title,
      phone: person.phone_numbers?.[0],
      linkedinUrl: person.linkedin_url,
      company: {
        name: person.job_company_name ?? params.companyName,
        domain: person.job_company_website ?? params.domain,
        employeeCount: person.job_company_employee_count,
        industry: person.job_company_industry,
        country: person.location_country,
        city: person.location_locality,
      },
      dataSource: 'pdl',
      confidence: typeof data.likelihood === 'number' ? data.likelihood / 10 : 0.85,
    }
  } catch {
    return null
  }
}

export async function pdlCompanyEnrich(domain: string, companyName?: string): Promise<CompanyData | null> {
  const { pdlApiKey } = config.enrichment
  if (!pdlApiKey) return null

  try {
    const body: Record<string, string> = {}
    if (domain) body.website = domain
    if (companyName) body.name = companyName

    const res = await fetch(PDL_COMPANY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': pdlApiKey,
      },
      body: JSON.stringify({ params: body }),
    })

    if (!res.ok) return null

    const data = await res.json() as {
      status?: number
      data?: {
        name?: string
        website?: string
        employee_count?: number
        industry?: string
        location?: { country?: string; locality?: string }
        tags?: string[]
        size?: string
      }
    }

    if (data.status !== 200 || !data.data) return null

    const company = data.data
    return {
      name: company.name ?? companyName,
      domain: company.website ?? domain,
      employeeCount: company.employee_count,
      industry: company.industry,
      country: company.location?.country,
      city: company.location?.locality,
      technographics: company.tags ?? [],
    }
  } catch {
    return null
  }
}

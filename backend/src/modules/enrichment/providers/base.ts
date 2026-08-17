export interface CompanyData {
  name?: string
  domain?: string
  employeeCount?: number
  industry?: string
  country?: string
  city?: string
  revenueRange?: string
  technographics?: string[]
}

export interface EnrichmentResult {
  email?: string
  firstName?: string
  lastName?: string
  jobTitle?: string
  phone?: string
  linkedinUrl?: string
  company?: CompanyData
  dataSource: string
  confidence: number
}

export interface EnrichmentParams {
  firstName: string
  lastName: string
  domain: string
  companyName?: string
  linkedinUrl?: string
}

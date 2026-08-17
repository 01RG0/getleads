import { config } from '../../config.js'

export interface PhoneVerificationResult {
  valid: boolean
  number: string
  localFormat: string
  internationalFormat: string
  countryCode: string
  countryName: string
  carrier: string
  lineType: string
}

export async function verifyPhone(phoneNumber: string): Promise<PhoneVerificationResult | null> {
  const apiKey = config.enrichment.numverifyApiKey
  if (!apiKey) return null
  try {
    const params = new URLSearchParams({ access_key: apiKey, number: phoneNumber, format: '1' })
    const res = await fetch(`https://apilayer.net/api/validate?${params}`, {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as any
    return {
      valid: !!data.valid,
      number: data.number ?? phoneNumber,
      localFormat: data.local_format ?? '',
      internationalFormat: data.international_format ?? '',
      countryCode: data.country_code ?? '',
      countryName: data.country_name ?? '',
      carrier: data.carrier ?? '',
      lineType: data.line_type ?? '',
    }
  } catch {
    return null
  }
}

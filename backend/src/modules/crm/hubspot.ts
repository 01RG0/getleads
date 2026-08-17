import { getBreaker } from '../../lib/circuit-breaker.js'

export interface CrmContact {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  jobTitle?: string
  linkedinUrl?: string
  companyName?: string
  companyDomain?: string
}

export interface CrmSyncResult {
  provider: string
  externalId: string
  action: 'created' | 'updated'
}

export async function hubspotUpsertContact(contact: CrmContact, accessToken: string): Promise<CrmSyncResult> {
  const breaker = getBreaker('hubspot', { requestTimeoutMs: 10000 })

  return breaker.execute(async () => {
    // Search for existing contact by email
    if (contact.email) {
      const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: contact.email }] }],
          properties: ['hs_object_id'],
          limit: 1,
        }),
      })
      const searchData = await searchRes.json() as { results?: Array<{ id: string }> }
      const existing = searchData.results?.[0]

      const properties: Record<string, string> = {
        firstname: contact.firstName,
        lastname: contact.lastName,
        ...(contact.email && { email: contact.email }),
        ...(contact.phone && { phone: contact.phone }),
        ...(contact.jobTitle && { jobtitle: contact.jobTitle }),
        ...(contact.linkedinUrl && { hs_linkedin_slug: contact.linkedinUrl }),
        ...(contact.companyName && { company: contact.companyName }),
        ...(contact.companyDomain && { website: `https://${contact.companyDomain}` }),
      }

      if (existing) {
        await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${existing.id}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ properties }),
        })
        return { provider: 'hubspot', externalId: existing.id, action: 'updated' }
      }

      const createRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties }),
      })
      const created = await createRes.json() as { id: string }
      return { provider: 'hubspot', externalId: created.id, action: 'created' }
    }

    // No email — always create
    const createRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        properties: {
          firstname: contact.firstName,
          lastname: contact.lastName,
          ...(contact.jobTitle && { jobtitle: contact.jobTitle }),
          ...(contact.companyName && { company: contact.companyName }),
        },
      }),
    })
    const created = await createRes.json() as { id: string }
    return { provider: 'hubspot', externalId: created.id, action: 'created' }
  })
}

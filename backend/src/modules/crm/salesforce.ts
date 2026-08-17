import { getBreaker } from '../../lib/circuit-breaker.js'
import type { CrmContact, CrmSyncResult } from './hubspot.js'

interface SalesforceTokenResponse {
  access_token: string
  instance_url: string
}

export async function salesforceGetToken(
  clientId: string,
  clientSecret: string,
  username: string,
  password: string,
  securityToken: string,
): Promise<SalesforceTokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: clientId,
    client_secret: clientSecret,
    username,
    password: password + securityToken,
  })
  const res = await fetch('https://login.salesforce.com/services/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  if (!res.ok) throw new Error(`Salesforce auth failed: ${res.status}`)
  return res.json() as Promise<SalesforceTokenResponse>
}

export async function salesforceUpsertContact(
  contact: CrmContact,
  accessToken: string,
  instanceUrl: string,
): Promise<CrmSyncResult> {
  const breaker = getBreaker('salesforce', { requestTimeoutMs: 12000 })
  const base = `${instanceUrl}/services/data/v59.0`
  const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }

  return breaker.execute(async () => {
    // Upsert by email using external ID field (Email)
    if (contact.email) {
      const upsertRes = await fetch(
        `${base}/sobjects/Contact/Email/${encodeURIComponent(contact.email)}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            FirstName: contact.firstName,
            LastName: contact.lastName,
            Email: contact.email,
            ...(contact.phone && { Phone: contact.phone }),
            ...(contact.jobTitle && { Title: contact.jobTitle }),
            ...(contact.companyName && { AccountId: undefined, Department: contact.companyName }),
          }),
        },
      )

      if (upsertRes.status === 201) {
        const body = await upsertRes.json() as { id: string }
        return { provider: 'salesforce', externalId: body.id, action: 'created' }
      }
      if (upsertRes.status === 204) {
        return { provider: 'salesforce', externalId: contact.email, action: 'updated' }
      }
      throw new Error(`Salesforce upsert failed: ${upsertRes.status}`)
    }

    // No email — POST create
    const createRes = await fetch(`${base}/sobjects/Contact`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        FirstName: contact.firstName,
        LastName: contact.lastName,
        ...(contact.phone && { Phone: contact.phone }),
        ...(contact.jobTitle && { Title: contact.jobTitle }),
      }),
    })
    const body = await createRes.json() as { id: string }
    return { provider: 'salesforce', externalId: body.id, action: 'created' }
  })
}

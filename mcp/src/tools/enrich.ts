const API_URL = process.env.LEADSCALE_API_URL ?? 'http://localhost:3001'
const API_KEY = process.env.LEADSCALE_API_KEY ?? ''

export const enrichPersonTool = {
  name: 'enrich_person',
  description: 'Find email, phone, job title, and company data for a person given their name and company domain.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      first_name: { type: 'string', description: 'First name' },
      last_name: { type: 'string', description: 'Last name' },
      domain: { type: 'string', description: 'Company domain e.g. acme.com' },
      company_name: { type: 'string', description: 'Company name (optional)' },
    },
    required: ['first_name', 'last_name', 'domain'],
  },
  async execute(args: { first_name: string; last_name: string; domain: string; company_name?: string }) {
    const res = await fetch(`${API_URL}/api/v1/enrich/person`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    })
    return res.json()
  },
}

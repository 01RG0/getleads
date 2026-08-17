const API_URL = process.env.LEADSCALE_API_URL ?? 'http://localhost:3001'
const API_KEY = process.env.LEADSCALE_API_KEY ?? ''

export const osintCrawlTool = {
  name: 'run_osint',
  description: 'Crawl a company domain to extract emails, phones, social links, and tech stack.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      domain: { type: 'string', description: 'Company domain e.g. acme.com' },
      include_maps: { type: 'boolean', description: 'Include Google Maps data' },
    },
    required: ['domain'],
  },
  async execute(args: { domain: string; include_maps?: boolean }) {
    const res = await fetch(`${API_URL}/api/v1/osint/crawl`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    })
    return res.json()
  },
}

export const searchContactsTool = {
  name: 'search_contacts',
  description: 'Search saved contacts by job title, industry, location, or company size.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      job_titles: { type: 'array', items: { type: 'string' }, description: 'Filter by job titles' },
      industries: { type: 'array', items: { type: 'string' }, description: 'Filter by industries' },
      locations: { type: 'array', items: { type: 'string' }, description: 'Filter by city or country' },
      limit: { type: 'number', description: 'Max results (default 25)' },
    },
    required: [],
  },
  async execute(args: { job_titles?: string[]; industries?: string[]; locations?: string[]; limit?: number }) {
    const res = await fetch(`${API_URL}/api/v1/contacts/search`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ filters: args, pagination: { limit: args.limit ?? 25 } }),
    })
    return res.json()
  },
}

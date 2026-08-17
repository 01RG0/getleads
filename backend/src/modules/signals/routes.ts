import type { FastifyInstance } from 'fastify'
import { apiKeyPreHandler } from '../tenancy/middleware/apiKey.js'
import { getBreaker } from '../../lib/circuit-breaker.js'
import { config } from '../../config.js'

interface FundingSignal {
  company: string
  amount?: string
  round?: string
  date?: string
  investors?: string[]
}

interface HiringSignal {
  company: string
  openRoles: number
  departments: string[]
  latestRole?: string
}

async function fetchFundingSignals(domain: string): Promise<FundingSignal[]> {
  if (!config.enrichment.serperApiKey) return []
  return getBreaker('serper-funding', { requestTimeoutMs: 10000 }).execute(async () => {
    const res = await fetch('https://google.serper.dev/news', {
      method: 'POST',
      headers: { 'X-API-KEY': config.enrichment.serperApiKey!, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `${domain} funding raised series`, num: 5 }),
    })
    if (!res.ok) return []
    const json = await res.json() as { news?: Array<{ title: string; snippet?: string; date?: string }> }
    return (json.news ?? []).map((n) => ({ company: domain, amount: undefined, round: n.title, date: n.date, investors: [] }))
  }).catch(() => [])
}

async function fetchHiringSignals(domain: string): Promise<HiringSignal | null> {
  if (!config.enrichment.serperApiKey) return null
  return getBreaker('serper-hiring', { requestTimeoutMs: 10000 }).execute(async () => {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': config.enrichment.serperApiKey!, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `site:linkedin.com/jobs "${domain}" OR "${domain.replace('.', ' ')}"`, num: 10 }),
    })
    if (!res.ok) return null
    const json = await res.json() as { organic?: Array<{ title: string }> }
    const results = json.organic ?? []
    return { company: domain, openRoles: results.length, departments: [], latestRole: results[0]?.title }
  }).catch(() => null)
}

export default async function signalsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/signals/funding', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const query = request.query as { domain?: string }
    if (!query.domain) return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'domain is required' })
    const signals = await fetchFundingSignals(query.domain)
    return { success: true, data: { domain: query.domain, signals } }
  })

  app.get('/v1/signals/hiring', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const query = request.query as { domain?: string }
    if (!query.domain) return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'domain is required' })
    const signals = await fetchHiringSignals(query.domain)
    return { success: true, data: { domain: query.domain, signals } }
  })
}

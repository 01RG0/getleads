import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/db.js'
import { apiKeyPreHandler } from '../tenancy/middleware/apiKey.js'
import { domainSearch, domainEmailCount } from './providers/domainSearch.js'

export default async function domainRoutes(app: FastifyInstance): Promise<void> {
  // GET /v1/domain/emails?domain=acme.com&limit=10&page=1
  app.get('/v1/domain/emails', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const query = request.query as { domain?: string; limit?: string; page?: string }
    if (!query.domain) return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'domain is required' })

    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '10')))
    const creditsNeeded = Math.ceil(limit / 10)

    const workspace = await prisma.workspace.findUnique({ where: { id: request.workspaceId }, select: { creditBalance: true } })
    if (!workspace || workspace.creditBalance < creditsNeeded) {
      return reply.status(402).send({ type: 'https://leadscale.io/errors/insufficient-credits', title: 'Insufficient Credits', status: 402, detail: `Need ${creditsNeeded} credits` })
    }

    const emails = await domainSearch(query.domain, limit)

    if (emails.length > 0) {
      await prisma.$transaction([
        prisma.creditLedger.create({ data: { workspaceId: request.workspaceId, amount: -creditsNeeded, transactionType: 'ENRICHMENT_DEDUCTION', description: `Domain search: ${query.domain}` } }),
        prisma.workspace.update({ where: { id: request.workspaceId }, data: { creditBalance: { decrement: creditsNeeded } } }),
      ])
    }

    return { success: true, data: { domain: query.domain, emails, total: emails.length }, meta: { credits_deducted: emails.length > 0 ? creditsNeeded : 0, credits_remaining: (workspace.creditBalance - (emails.length > 0 ? creditsNeeded : 0)) } }
  })

  // GET /v1/domain/count?domain=acme.com
  app.get('/v1/domain/count', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const query = request.query as { domain?: string }
    if (!query.domain) return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'domain is required' })
    const count = await domainEmailCount(query.domain)
    if (!count) return reply.status(503).send({ type: 'https://leadscale.io/errors/service-unavailable', title: 'Service Unavailable', status: 503, detail: 'HUNT_API_KEY not configured' })
    return { success: true, data: { domain: query.domain, ...count } }
  })

  // POST /v1/enrich/social — append Twitter/GitHub to existing contact
  app.post('/v1/enrich/social', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const body = request.body as { contact_id?: string }
    if (!body?.contact_id) return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'contact_id is required' })

    const contact = await prisma.contact.findFirst({ where: { id: body.contact_id }, include: { company: { select: { domain: true } } } })
    if (!contact) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'Contact not found' })

    const updates: Record<string, string | null> = {}
    if (contact.email && !contact.githubUsername) {
      const { githubEnrich } = await import('./providers/githubEnrich.js')
      const gh = await githubEnrich(contact.email)
      if (gh?.githubUsername) updates.githubUsername = gh.githubUsername
    }

    if (Object.keys(updates).length > 0) {
      await prisma.contact.update({ where: { id: contact.id }, data: updates })
    }

    return { success: true, data: { contact_id: body.contact_id, ...updates } }
  })
}

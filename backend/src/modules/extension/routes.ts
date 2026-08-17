import type { FastifyInstance } from 'fastify'
import { apiKeyPreHandler } from '../tenancy/middleware/apiKey.js'
import { prisma } from '../../lib/db.js'

export default async function extensionRoutes(app: FastifyInstance): Promise<void> {
  // Quick enrich endpoint optimized for browser extension (sync, low latency)
  app.post('/v1/extension/enrich', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const body = request.body as { email?: string; linkedin_url?: string; domain?: string; first_name?: string; last_name?: string }
    if (!body?.email && !body?.linkedin_url) {
      return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'email or linkedin_url is required' })
    }

    const ws = await prisma.workspace.findUnique({ where: { id: request.workspaceId }, select: { creditBalance: true } })
    if (!ws || ws.creditBalance < 1) {
      return reply.status(402).send({ type: 'https://leadscale.io/errors/insufficient-credits', title: 'Insufficient Credits', status: 402, detail: 'Need 1 credit' })
    }

    if (body.email) {
      const existing = await prisma.contact.findFirst({ where: { email: body.email }, include: { company: { select: { name: true, domain: true, industry: true } } } })
      if (existing) return { success: true, data: existing, meta: { source: 'cache', credits_deducted: 0 } }
    }

    return reply.status(202).send({ success: true, data: null, meta: { message: 'Enrichment queued — poll /v1/enrich/jobs/:jobId', credits_deducted: 0 } })
  })

  // Profile lookup from LinkedIn URL
  app.get('/v1/extension/lookup', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const query = request.query as { email?: string }
    if (!query.email) return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'email is required' })
    const contact = await prisma.contact.findFirst({ where: { email: query.email }, include: { company: { select: { name: true, domain: true, industry: true, country: true } } } })
    return { success: true, data: contact ?? null }
  })
}

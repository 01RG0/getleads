import type { FastifyInstance } from 'fastify'
import { apiKeyPreHandler } from '../tenancy/middleware/apiKey.js'
import { prisma } from '../../lib/db.js'
import { createHmac } from 'crypto'

export async function registerZapierRoutes(app: FastifyInstance): Promise<void> {
  // Zapier polling endpoint — returns latest enriched contacts
  app.get('/v1/zapier/contacts/new', { preHandler: apiKeyPreHandler }, async (request) => {
    const query = request.query as { since?: string; limit?: string }
    const since = query.since ? new Date(query.since) : new Date(Date.now() - 24 * 60 * 60 * 1000)
    const limit = Math.min(100, parseInt(query.limit ?? '10'))

    const contacts = await prisma.contact.findMany({
      where: { createdAt: { gte: since } },
      include: { company: { select: { name: true, domain: true, industry: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return contacts.map((c) => ({
      id: c.id,
      email: c.email,
      first_name: c.firstName,
      last_name: c.lastName,
      job_title: c.jobTitle,
      company_name: c.company?.name,
      company_domain: c.company?.domain,
      industry: c.company?.industry,
      created_at: c.createdAt.toISOString(),
    }))
  })

  // Zapier/Make webhook subscription (REST hooks pattern)
  app.post('/v1/zapier/subscribe', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const body = request.body as { hook_url?: string; event?: string; secret?: string }
    if (!body?.hook_url || !body?.event) {
      return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'hook_url and event are required' })
    }

    const validEvents = ['CONTACT_ENRICHED', 'CONTACT_VERIFIED', 'JOB_COMPLETED']
    if (!validEvents.includes(body.event)) {
      return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: `event must be one of: ${validEvents.join(', ')}` })
    }

    const secret = body.secret ?? createHmac('sha256', 'zapier').update(body.hook_url).digest('hex').slice(0, 32)
    const secretHash = createHmac('sha256', secret).update(body.hook_url).digest('hex')

    const webhook = await prisma.webhook.create({
      data: {
        workspaceId: request.workspaceId,
        url: body.hook_url,
        events: [body.event as 'CONTACT_ENRICHED' | 'CONTACT_VERIFIED' | 'JOB_COMPLETED'],
        secretHash,
        isActive: true,
      },
    })

    return reply.status(201).send({ id: webhook.id, hook_url: body.hook_url, event: body.event })
  })

  app.delete<{ Params: { id: string } }>('/v1/zapier/unsubscribe/:id', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const existing = await prisma.webhook.findFirst({ where: { id: request.params.id, workspaceId: request.workspaceId } })
    if (!existing) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'Webhook not found' })
    await prisma.webhook.delete({ where: { id: request.params.id } })
    return reply.status(204).send()
  })
}

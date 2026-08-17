import type { FastifyInstance } from 'fastify'
import { apiKeyPreHandler } from '../tenancy/middleware/apiKey.js'
import { scoreContact, scoreContactsInWorkspace } from './service.js'
import type { IcpCriteria } from './service.js'

export default async function scoringRoutes(app: FastifyInstance): Promise<void> {
  app.post('/v1/icp/score', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const body = request.body as { criteria?: IcpCriteria; contact_ids?: string[] }
    if (!body?.criteria) return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'criteria is required' })

    if (body.contact_ids?.length) {
      const results = await Promise.all(body.contact_ids.map(async (id) => {
        try { return { id, score: await scoreContact(id, body.criteria!) } } catch { return { id, score: null } }
      }))
      return { success: true, data: { scored: results } }
    }

    const count = await scoreContactsInWorkspace(request.workspaceId, body.criteria)
    return { success: true, data: { scored_count: count } }
  })

  app.get<{ Params: { contactId: string } }>('/v1/icp/score/:contactId', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const { prisma } = await import('../../lib/db.js')
    const contact = await prisma.contact.findFirst({ where: { id: request.params.contactId }, select: { id: true, icpScore: true, firstName: true, lastName: true } })
    if (!contact) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'Contact not found' })
    return { success: true, data: contact }
  })
}

import type { FastifyInstance } from 'fastify'
import { apiKeyPreHandler } from '../tenancy/middleware/apiKey.js'
import {
  addToSuppressionList,
  removeFromSuppressionList,
  exportContactData,
  purgeContact,
} from './service.js'
import { prisma } from '../../lib/db.js'

export default async function gdprRoutes(app: FastifyInstance): Promise<void> {
  // POST /v1/gdpr/suppress
  app.post('/v1/gdpr/suppress', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const body = request.body as { email?: string; reason?: string }
    if (!body?.email) {
      return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'email is required' })
    }
    await addToSuppressionList(request.workspaceId, body.email, body.reason ?? 'user_request')
    return reply.status(201).send({ success: true, data: { email: body.email, suppressed: true } })
  })

  // DELETE /v1/gdpr/suppress/:email
  app.delete<{ Params: { email: string } }>('/v1/gdpr/suppress/:email', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const { email } = request.params
    const removed = await removeFromSuppressionList(request.workspaceId, email)
    if (!removed) {
      return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'Email not in suppression list' })
    }
    return reply.status(204).send()
  })

  // POST /v1/gdpr/purge/:contactId
  app.post<{ Params: { contactId: string } }>('/v1/gdpr/purge/:contactId', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const { contactId } = request.params
    const contact = await prisma.contact.findFirst({ where: { id: contactId }, select: { id: true } })
    if (!contact) {
      return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'Contact not found' })
    }
    await purgeContact(contactId)
    return reply.send({ success: true, data: { contact_id: contactId, purged: true } })
  })

  // GET /v1/gdpr/export/:contactId
  app.get<{ Params: { contactId: string } }>('/v1/gdpr/export/:contactId', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const { contactId } = request.params
    const data = await exportContactData(contactId)
    if (!data) {
      return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'Contact not found' })
    }
    return reply.send({ success: true, data })
  })

  // POST /v1/gdpr/suppress/bulk - CSV upload
  app.post('/v1/gdpr/suppress/bulk', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const body = request.body as { emails?: string[]; reason?: string }
    if (!Array.isArray(body?.emails) || body.emails.length === 0) {
      return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'emails array is required' })
    }
    if (body.emails.length > 10000) {
      return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'Maximum 10000 emails per bulk suppression' })
    }
    const reason = body.reason ?? 'bulk_import'
    let added = 0
    for (const email of body.emails) {
      try {
        await addToSuppressionList(request.workspaceId, email.trim().toLowerCase(), reason)
        added++
      } catch { /* skip duplicates */ }
    }
    return reply.status(201).send({ success: true, data: { requested: body.emails.length, added } })
  })

  // GET /v1/gdpr/suppress - list suppressed emails
  app.get('/v1/gdpr/suppress', { preHandler: apiKeyPreHandler }, async (request) => {
    const query = request.query as { page?: string; limit?: string }
    const page = Math.max(1, parseInt(query.page ?? '1'))
    const limit = Math.min(100, parseInt(query.limit ?? '25'))
    const [total, items] = await Promise.all([
      prisma.suppressionList.count({ where: { workspaceId: request.workspaceId } }),
      prisma.suppressionList.findMany({ where: { workspaceId: request.workspaceId }, skip: (page - 1) * limit, take: limit, orderBy: { suppressedAt: 'desc' } }),
    ])
    return { success: true, data: { items, total, page, limit } }
  })
}

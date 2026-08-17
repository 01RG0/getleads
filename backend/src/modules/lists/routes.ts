import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/db.js'
import { apiKeyPreHandler } from '../tenancy/middleware/apiKey.js'

export default async function listRoutes(app: FastifyInstance): Promise<void> {
  app.post('/v1/lists', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const body = request.body as { name?: string; description?: string }
    if (!body?.name) return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'name is required' })
    const list = await prisma.savedList.create({ data: { workspaceId: request.workspaceId, name: body.name, description: body.description } })
    return reply.status(201).send({ success: true, data: list })
  })

  app.get('/v1/lists', { preHandler: apiKeyPreHandler }, async (request) => {
    const lists = await prisma.savedList.findMany({ where: { workspaceId: request.workspaceId }, orderBy: { createdAt: 'desc' } })
    return { success: true, data: lists }
  })

  app.get<{ Params: { id: string } }>('/v1/lists/:id', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const list = await prisma.savedList.findFirst({ where: { id: request.params.id, workspaceId: request.workspaceId } })
    if (!list) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'List not found' })
    return { success: true, data: list }
  })

  app.put<{ Params: { id: string } }>('/v1/lists/:id', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const existing = await prisma.savedList.findFirst({ where: { id: request.params.id, workspaceId: request.workspaceId } })
    if (!existing) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'List not found' })
    const body = request.body as { name?: string; description?: string }
    const updated = await prisma.savedList.update({ where: { id: request.params.id }, data: { ...(body.name && { name: body.name }), ...(body.description !== undefined && { description: body.description }) } })
    return { success: true, data: updated }
  })

  app.delete<{ Params: { id: string } }>('/v1/lists/:id', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const existing = await prisma.savedList.findFirst({ where: { id: request.params.id, workspaceId: request.workspaceId } })
    if (!existing) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'List not found' })
    await prisma.savedList.delete({ where: { id: request.params.id } })
    return reply.status(204).send()
  })

  app.post<{ Params: { id: string } }>('/v1/lists/:id/contacts', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const list = await prisma.savedList.findFirst({ where: { id: request.params.id, workspaceId: request.workspaceId } })
    if (!list) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'List not found' })
    const body = request.body as { contact_ids?: string[] }
    if (!Array.isArray(body?.contact_ids) || body.contact_ids.length === 0) return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'contact_ids required' })
    const { count } = await prisma.listContact.createMany({ data: body.contact_ids.map((cId) => ({ listId: request.params.id, contactId: cId })), skipDuplicates: true })
    await prisma.savedList.update({ where: { id: request.params.id }, data: { contactCount: { increment: count } } })
    return { success: true, data: { added: count } }
  })

  app.delete<{ Params: { id: string; contactId: string } }>('/v1/lists/:id/contacts/:contactId', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const deleted = await prisma.listContact.deleteMany({ where: { listId: request.params.id, contactId: request.params.contactId } })
    if (deleted.count > 0) await prisma.savedList.update({ where: { id: request.params.id }, data: { contactCount: { decrement: deleted.count } } })
    return reply.status(204).send()
  })

  app.get<{ Params: { id: string } }>('/v1/lists/:id/contacts', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const list = await prisma.savedList.findFirst({ where: { id: request.params.id, workspaceId: request.workspaceId } })
    if (!list) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'List not found' })
    const query = request.query as { page?: string; limit?: string }
    const page = Math.max(1, parseInt(query.page ?? '1'))
    const limit = Math.min(100, parseInt(query.limit ?? '25'))
    const members = await prisma.listContact.findMany({
      where: { listId: request.params.id },
      include: { contact: { include: { company: { select: { name: true, domain: true } } } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { addedAt: 'desc' },
    })
    return { success: true, data: { contacts: members.map((m) => m.contact), total: list.contactCount, page, limit } }
  })
}

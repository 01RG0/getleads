import { randomUUID } from 'crypto'
import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/db.js'
import { apiKeyPreHandler } from '../tenancy/middleware/apiKey.js'
import { WebhookEvent } from '@prisma/client'
import { dispatchWebhook, hashSecret } from './service.js'

export default async function webhookRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/webhooks', { preHandler: apiKeyPreHandler }, async (request) => {
    const webhooks = await prisma.webhook.findMany({
      where: { workspaceId: request.workspaceId },
      select: { id: true, url: true, events: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: webhooks }
  })

  app.post('/v1/webhooks', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const body = request.body as { url?: string; events?: string[]; secret?: string }
    if (!body?.url || !body?.events?.length || !body?.secret) {
      return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'url, events, and secret are required' })
    }

    const validEvents = Object.values(WebhookEvent)
    const invalidEvents = body.events.filter((e) => !validEvents.includes(e as WebhookEvent))
    if (invalidEvents.length) {
      return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: `Invalid events: ${invalidEvents.join(', ')}` })
    }

    const webhook = await prisma.webhook.create({
      data: {
        workspaceId: request.workspaceId,
        url: body.url,
        events: body.events as WebhookEvent[],
        secretHash: hashSecret(body.secret),
      },
      select: { id: true, url: true, events: true, isActive: true, createdAt: true },
    })

    return reply.status(201).send({ success: true, data: webhook })
  })

  app.get('/v1/webhooks/:id', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const webhook = await prisma.webhook.findFirst({
      where: { id, workspaceId: request.workspaceId },
      include: { deliveries: { orderBy: { createdAt: 'desc' }, take: 20 } },
    })
    if (!webhook) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'Webhook not found' })
    return { success: true, data: webhook }
  })

  app.put('/v1/webhooks/:id', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as { url?: string; events?: string[] }
    const existing = await prisma.webhook.findFirst({ where: { id, workspaceId: request.workspaceId } })
    if (!existing) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'Webhook not found' })

    const updated = await prisma.webhook.update({
      where: { id },
      data: {
        ...(body.url && { url: body.url }),
        ...(body.events && { events: body.events as WebhookEvent[] }),
      },
      select: { id: true, url: true, events: true, isActive: true, updatedAt: true },
    })
    return { success: true, data: updated }
  })

  app.patch('/v1/webhooks/:id/toggle', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const existing = await prisma.webhook.findFirst({ where: { id, workspaceId: request.workspaceId } })
    if (!existing) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'Webhook not found' })

    const updated = await prisma.webhook.update({
      where: { id },
      data: { isActive: !existing.isActive },
      select: { id: true, isActive: true },
    })
    return { success: true, data: updated }
  })

  app.delete('/v1/webhooks/:id', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const existing = await prisma.webhook.findFirst({ where: { id, workspaceId: request.workspaceId } })
    if (!existing) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'Webhook not found' })
    await prisma.webhook.delete({ where: { id } })
    return reply.status(204).send()
  })

  app.post('/v1/webhooks/:id/test', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const existing = await prisma.webhook.findFirst({ where: { id, workspaceId: request.workspaceId } })
    if (!existing) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'Webhook not found' })

    await dispatchWebhook(request.workspaceId, WebhookEvent.CONTACT_ENRICHED, {
      test: true,
      request_id: randomUUID(),
      message: 'Test webhook delivery from LeadScale',
    })
    return { success: true, data: { message: 'Test event dispatched' } }
  })
}

export { registerZapierRoutes } from './zapier.js'

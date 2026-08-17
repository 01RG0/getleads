import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { randomUUID } from 'crypto'
import { UserRole } from '@prisma/client'
import { prisma } from '../../lib/db.js'
import { config } from '../../config.js'
import { apiKeyPreHandler } from '../tenancy/middleware/apiKey.js'
import { routeLLM } from './router.js'
import type { LLMRequest } from './types.js'

function requireAdminSecret(request: FastifyRequest, reply: FastifyReply): boolean {
  if (request.headers['authorization'] !== `Bearer ${config.apiSecretKey}`) {
    reply.status(401).send({
      type: 'https://leadscale.io/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Admin secret required',
    })
    return false
  }
  return true
}

export default async function llmRoutes(app: FastifyInstance): Promise<void> {
  // POST /v1/llm/complete
  // Requires a valid API key (any workspace member)
  app.post(
    '/v1/llm/complete',
    {
      preHandler: apiKeyPreHandler,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const startMs = Date.now()
      const body = request.body as LLMRequest

      if (!body?.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
        return reply.status(400).send({
          type: 'https://leadscale.io/errors/validation',
          title: 'Bad Request',
          status: 400,
          detail: '"messages" must be a non-empty array',
          instance: request.url,
        })
      }

      if (!body.taskType) {
        return reply.status(400).send({
          type: 'https://leadscale.io/errors/validation',
          title: 'Bad Request',
          status: 400,
          detail: '"taskType" is required',
          instance: request.url,
        })
      }

      const data = await routeLLM(body)
      const executionTimeMs = Date.now() - startMs

      return reply.status(200).send({
        success: true,
        data,
        meta: {
          request_id: randomUUID(),
          execution_time_ms: executionTimeMs,
        },
      })
    },
  )

  // POST /v1/llm/providers
  // Admin-only: returns active provider list. Requires AGENCY_OWNER role in the workspace.
  app.post(
    '/v1/llm/providers',
    {
      preHandler: apiKeyPreHandler,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const workspaceId = request.workspaceId

      // Check that at least one AGENCY_OWNER member exists in this workspace
      const ownerMember = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          role: UserRole.AGENCY_OWNER,
        },
      })

      if (!ownerMember) {
        return reply.status(403).send({
          type: 'https://leadscale.io/errors/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: 'This endpoint requires AGENCY_OWNER role',
          instance: request.url,
        })
      }

      const providers = await prisma.aiProvider.findMany({
        where: { isActive: true },
        orderBy: { priorityOrder: 'asc' },
        select: {
          id: true,
          name: true,
          baseUrl: true,
          isActive: true,
          priorityOrder: true,
          costPer1kInputTokens: true,
          costPer1kOutputTokens: true,
          rateLimitRpm: true,
          rateLimitTpm: true,
          createdAt: true,
          updatedAt: true,
          // Intentionally omit apiKeyEncrypted
        },
      })

      return reply.status(200).send({
        success: true,
        data: providers,
        meta: {
          request_id: randomUUID(),
          total: providers.length,
        },
      })
    },
  )

  // GET /v1/admin/llm/providers — list all providers (admin)
  app.get('/v1/admin/llm/providers', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!requireAdminSecret(request, reply)) return
    const providers = await prisma.aiProvider.findMany({
      orderBy: { priorityOrder: 'asc' },
    })
    return reply.send({ success: true, data: providers })
  })

  // POST /v1/admin/llm/providers — create provider (admin)
  app.post('/v1/admin/llm/providers', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!requireAdminSecret(request, reply)) return
    const body = request.body as {
      name: string
      baseUrl: string
      priorityOrder?: number
      rateLimitRpm?: number
      rateLimitTpm?: number
      costPer1kInputTokens?: number
      costPer1kOutputTokens?: number
      apiKeyEncrypted?: string
      isActive?: boolean
    }
    if (!body?.name || !body?.baseUrl) {
      return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'name and baseUrl are required' })
    }
    const provider = await prisma.aiProvider.create({
      data: {
        name: body.name,
        baseUrl: body.baseUrl,
        priorityOrder: body.priorityOrder ?? 99,
        rateLimitRpm: body.rateLimitRpm ?? 60,
        rateLimitTpm: body.rateLimitTpm ?? 100000,
        costPer1kInputTokens: body.costPer1kInputTokens ?? 0,
        costPer1kOutputTokens: body.costPer1kOutputTokens ?? 0,
        apiKeyEncrypted: body.apiKeyEncrypted ?? '',
        isActive: body.isActive ?? true,
      },
    })
    return reply.status(201).send({ success: true, data: provider })
  })

  // PUT /v1/admin/llm/providers/:id — update provider (admin)
  app.put<{ Params: { id: string } }>('/v1/admin/llm/providers/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!requireAdminSecret(request, reply)) return
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, unknown>
    const existing = await prisma.aiProvider.findUnique({ where: { id } })
    if (!existing) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'Provider not found' })
    const allowed = ['name', 'baseUrl', 'priorityOrder', 'rateLimitRpm', 'rateLimitTpm', 'costPer1kInputTokens', 'costPer1kOutputTokens', 'apiKeyEncrypted']
    const data: Record<string, unknown> = {}
    for (const key of allowed) {
      if (body[key] !== undefined) data[key] = body[key]
    }
    const updated = await prisma.aiProvider.update({ where: { id }, data })
    return reply.send({ success: true, data: updated })
  })

  // PATCH /v1/admin/llm/providers/:id/toggle — toggle isActive (admin)
  app.patch<{ Params: { id: string } }>('/v1/admin/llm/providers/:id/toggle', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!requireAdminSecret(request, reply)) return
    const { id } = request.params as { id: string }
    const existing = await prisma.aiProvider.findUnique({ where: { id } })
    if (!existing) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'Provider not found' })
    const updated = await prisma.aiProvider.update({ where: { id }, data: { isActive: !existing.isActive } })
    return reply.send({ success: true, data: { id: updated.id, isActive: updated.isActive } })
  })

  // DELETE /v1/admin/llm/providers/:id — delete provider (admin)
  app.delete<{ Params: { id: string } }>('/v1/admin/llm/providers/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!requireAdminSecret(request, reply)) return
    const { id } = request.params as { id: string }
    const existing = await prisma.aiProvider.findUnique({ where: { id } })
    if (!existing) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'Provider not found' })
    await prisma.aiProvider.delete({ where: { id } })
    return reply.status(204).send()
  })
}

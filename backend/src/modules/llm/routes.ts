import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { randomUUID } from 'crypto'
import { UserRole } from '@prisma/client'
import { prisma } from '../../lib/db.js'
import { apiKeyPreHandler } from '../tenancy/middleware/apiKey.js'
import { routeLLM } from './router.js'
import type { LLMRequest } from './types.js'

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
}

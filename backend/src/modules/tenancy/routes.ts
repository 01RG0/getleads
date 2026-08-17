import type { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { prisma } from '../../lib/db.js'
import { apiKeyPreHandler } from './middleware/apiKey.js'
import { getBalance, allocateToChild, CreditTxType, issueApiKey, revokeApiKey, listApiKeys } from './service.js'

export default async function tenancyRoutes(app: FastifyInstance) {
  app.get(
    '/v1/workspaces/api-keys',
    { preHandler: [apiKeyPreHandler] },
    async (request) => listApiKeys(request.workspaceId),
  )

  app.post(
    '/v1/workspaces/api-keys',
    { preHandler: [apiKeyPreHandler] },
    async (request, reply) => {
      const body = request.body as { name: string }
      const key = await issueApiKey(request.workspaceId, body.name)
      return reply.status(201).send({ ...key, warning: 'Store this API key securely; it will not be shown again.' })
    },
  )

  app.delete(
    '/v1/workspaces/api-keys/:keyId',
    { preHandler: [apiKeyPreHandler] },
    async (request, reply) => {
      const { keyId } = request.params as { keyId: string }
      await revokeApiKey(keyId, request.workspaceId)
      return reply.status(204).send()
    },
  )

  app.get(
    '/v1/workspaces/credits',
    { preHandler: [apiKeyPreHandler] },
    async (request, reply) => {
      const start = Date.now()
      const ws = await prisma.workspace.findUnique({
        where: { id: request.workspaceId },
        select: {
          id: true,
          name: true,
          monthlyCreditQuota: true,
          creditBalance: true,
          organization: { select: { tier: true } },
        },
      })
      if (!ws) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'Workspace not found' })

      const childAllocated = await prisma.creditLedger.aggregate({
        where: { workspaceId: ws.id, transactionType: CreditTxType.AGENCY_CHILD_TRANSFER, amount: { lt: 0 } },
        _sum: { amount: true },
      })

      return {
        success: true,
        data: {
          workspace_id: ws.id,
          workspace_name: ws.name,
          plan_tier: ws.organization.tier,
          credit_summary: {
            total_credits_allocated: ws.monthlyCreditQuota,
            credits_used_this_period: ws.monthlyCreditQuota - ws.creditBalance,
            credits_remaining: ws.creditBalance,
            sub_workspace_allocated: Math.abs(childAllocated._sum.amount ?? 0),
          },
        },
        meta: { request_id: randomUUID(), execution_time_ms: Date.now() - start },
      }
    },
  )

  app.get(
    '/v1/workspaces',
    { preHandler: [apiKeyPreHandler] },
    async (request, reply) => {
      const start = Date.now()
      const ws = await prisma.workspace.findUnique({
        where: { id: request.workspaceId },
        select: { organizationId: true },
      })
      if (!ws) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'Workspace not found' })

      const workspaces = await prisma.workspace.findMany({
        where: { organizationId: ws.organizationId },
        select: { id: true, name: true, type: true, creditBalance: true, monthlyCreditQuota: true },
      })
      return { success: true, data: { workspaces }, meta: { request_id: randomUUID(), execution_time_ms: Date.now() - start } }
    },
  )

  app.post(
    '/v1/workspaces/child',
    { preHandler: [apiKeyPreHandler] },
    async (request, reply) => {
      const start = Date.now()
      const body = request.body as { name: string }
      if (!body?.name) return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'name is required' })

      const parent = await prisma.workspace.findUnique({
        where: { id: request.workspaceId },
        select: { organizationId: true, type: true },
      })
      if (!parent) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'Parent workspace not found' })

      const child = await prisma.workspace.create({
        data: {
          organizationId: parent.organizationId,
          parentWorkspaceId: request.workspaceId,
          name: body.name,
          type: 'CLIENT_CHILD',
          creditBalance: 0,
          monthlyCreditQuota: 0,
        },
      })
      return { success: true, data: { workspace: child }, meta: { request_id: randomUUID(), execution_time_ms: Date.now() - start } }
    },
  )

  app.post(
    '/v1/workspaces/credits/allocate',
    { preHandler: [apiKeyPreHandler] },
    async (request, reply) => {
      const start = Date.now()
      const body = request.body as { child_workspace_id: string; amount: number }
      if (!body?.child_workspace_id || !body?.amount) {
        return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'child_workspace_id and amount are required' })
      }
      try {
        await allocateToChild(request.workspaceId, body.child_workspace_id, body.amount, 'system')
        const balance = await getBalance(request.workspaceId)
        return { success: true, data: { allocated: body.amount, parent_balance: balance?.balance }, meta: { request_id: randomUUID(), execution_time_ms: Date.now() - start } }
      } catch (err: any) {
        if (err.message === 'insufficient_credits') {
          return reply.status(402).send({ type: 'https://leadscale.io/errors/insufficient-credits', title: 'Insufficient Credits', status: 402, detail: 'Parent workspace does not have enough credits' })
        }
        throw err
      }
    },
  )
}

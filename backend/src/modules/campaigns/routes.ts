import { randomUUID } from 'crypto'
import type { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify'
import { CampaignStatus } from '@prisma/client'
import { prisma } from '../../lib/db.js'
import { apiKeyPreHandler } from '../tenancy/middleware/apiKey.js'
import {
  createCampaign,
  getCampaign,
  listCampaigns,
  enrollContacts,
  updateStatus,
  recordBounce,
} from './service.js'

// ─── RFC 7807 helpers ────────────────────────────────────────────────────────

function problem(
  reply: FastifyReply,
  status: number,
  title: string,
  detail: string,
  instance: string,
  requestId: string,
) {
  return reply.status(status).send({
    type: `https://leadscale.io/errors/${title.toLowerCase().replace(/\s+/g, '-')}`,
    title,
    status,
    detail,
    instance,
    meta: { request_id: requestId },
  })
}

function ok<T>(reply: FastifyReply, data: T, requestId: string, statusCode = 200) {
  return reply.status(statusCode).send({ data, meta: { request_id: requestId } })
}

function getRequestId(request: FastifyRequest): string {
  return (request.headers['x-request-id'] as string | undefined) ?? randomUUID()
}

// ─── Route bodies ────────────────────────────────────────────────────────────

interface CreateCampaignBody {
  name: string
}

interface PatchStatusBody {
  status: CampaignStatus
}

interface EnrollBody {
  contact_ids: string[]
}

interface BounceBody {
  contact_id: string
}

interface ListQuery {
  page?: number
  limit?: number
}

// ─── Plugin ──────────────────────────────────────────────────────────────────

export default async function campaignRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
) {
  // POST /v1/campaigns — create campaign
  fastify.post<{ Body: CreateCampaignBody }>(
    '/v1/campaigns',
    { preHandler: apiKeyPreHandler },
    async (request, reply) => {
      const rid = getRequestId(request)
      const { name } = request.body ?? {}

      if (!name || typeof name !== 'string' || name.trim() === '') {
        return problem(reply, 422, 'Unprocessable Entity', '`name` is required', request.url, rid)
      }

      const campaign = await createCampaign(request.workspaceId, name.trim())
      return ok(reply, campaign, rid, 201)
    },
  )

  // GET /v1/campaigns — list with pagination
  fastify.get<{ Querystring: ListQuery }>(
    '/v1/campaigns',
    { preHandler: apiKeyPreHandler },
    async (request, reply) => {
      const rid = getRequestId(request)
      const page = Math.max(1, Number(request.query.page) || 1)
      const limit = Math.min(100, Math.max(1, Number(request.query.limit) || 20))

      const { campaigns, total } = await listCampaigns(request.workspaceId, page, limit)

      return ok(
        reply,
        { campaigns, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
        rid,
      )
    },
  )

  // GET /v1/campaigns/:id — get single
  fastify.get<{ Params: { id: string } }>(
    '/v1/campaigns/:id',
    { preHandler: apiKeyPreHandler },
    async (request, reply) => {
      const rid = getRequestId(request)
      const { id } = request.params

      const campaign = await getCampaign(id, request.workspaceId)
      if (!campaign) {
        return problem(
          reply,
          404,
          'Not Found',
          `Campaign '${id}' not found`,
          request.url,
          rid,
        )
      }

      return ok(reply, campaign, rid)
    },
  )

  // PATCH /v1/campaigns/:id/status — update status
  fastify.patch<{ Params: { id: string }; Body: PatchStatusBody }>(
    '/v1/campaigns/:id/status',
    { preHandler: apiKeyPreHandler },
    async (request, reply) => {
      const rid = getRequestId(request)
      const { id } = request.params
      const { status } = request.body ?? {}

      if (!status || !Object.values(CampaignStatus).includes(status)) {
        return problem(
          reply,
          422,
          'Unprocessable Entity',
          `\`status\` must be one of: ${Object.values(CampaignStatus).join(', ')}`,
          request.url,
          rid,
        )
      }

      try {
        const campaign = await updateStatus(id, request.workspaceId, status)
        return ok(reply, campaign, rid)
      } catch (err: unknown) {
        if ((err as NodeJS.ErrnoException & { code?: string }).code === 'NOT_FOUND') {
          return problem(reply, 404, 'Not Found', `Campaign '${id}' not found`, request.url, rid)
        }
        throw err
      }
    },
  )

  // POST /v1/campaigns/:id/enroll — enroll contacts
  fastify.post<{ Params: { id: string }; Body: EnrollBody }>(
    '/v1/campaigns/:id/enroll',
    { preHandler: apiKeyPreHandler },
    async (request, reply) => {
      const rid = getRequestId(request)
      const { id } = request.params
      const { contact_ids } = request.body ?? {}

      if (!Array.isArray(contact_ids) || contact_ids.length === 0) {
        return problem(
          reply,
          422,
          'Unprocessable Entity',
          '`contact_ids` must be a non-empty array',
          request.url,
          rid,
        )
      }

      try {
        const result = await enrollContacts(id, contact_ids, request.workspaceId)
        return ok(reply, result, rid, 200)
      } catch (err: unknown) {
        if ((err as NodeJS.ErrnoException & { code?: string }).code === 'NOT_FOUND') {
          return problem(reply, 404, 'Not Found', `Campaign '${id}' not found`, request.url, rid)
        }
        throw err
      }
    },
  )

  // POST /v1/campaigns/:id/bounce — record bounce + trigger refund check
  fastify.post<{ Params: { id: string }; Body: BounceBody }>(
    '/v1/campaigns/:id/bounce',
    { preHandler: apiKeyPreHandler },
    async (request, reply) => {
      const rid = getRequestId(request)
      const { id } = request.params
      const { contact_id } = request.body ?? {}

      if (!contact_id || typeof contact_id !== 'string') {
        return problem(
          reply,
          422,
          'Unprocessable Entity',
          '`contact_id` is required',
          request.url,
          rid,
        )
      }

      // Verify campaign belongs to workspace before recording bounce
      const campaign = await getCampaign(id, request.workspaceId)
      if (!campaign) {
        return problem(reply, 404, 'Not Found', `Campaign '${id}' not found`, request.url, rid)
      }

      try {
        await recordBounce(id, contact_id)
      } catch (err: unknown) {
        if ((err as NodeJS.ErrnoException & { code?: string }).code === 'NOT_FOUND') {
          return problem(
            reply,
            404,
            'Not Found',
            `Contact '${contact_id}' is not enrolled in campaign '${id}'`,
            request.url,
            rid,
          )
        }
        throw err
      }

      // Refund check: issue 1 credit back to workspace for the bounced email
      // Fire-and-forget so the HTTP response isn't delayed by ledger writes
      prisma
        .$transaction([
          prisma.creditLedger.create({
            data: {
              workspaceId: campaign.workspaceId,
              amount: 1,
              transactionType: 'BOUNCE_REFUND',
              description: `Bounce refund for contact ${contact_id} in campaign ${id}`,
              referenceId: id,
            },
          }),
          prisma.workspace.update({
            where: { id: campaign.workspaceId },
            data: { creditBalance: { increment: 1 } },
          }),
        ])
        .catch((refundErr) => {
          fastify.log.error({ err: refundErr, campaignId: id, contactId: contact_id }, 'Bounce refund failed')
        })

      return ok(reply, { campaign_id: id, contact_id, bounced: true }, rid)
    },
  )
}

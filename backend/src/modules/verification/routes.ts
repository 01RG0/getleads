import type { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { apiKeyPreHandler } from '../tenancy/middleware/apiKey.js'
import { deductCredits, CreditTxType } from '../tenancy/service.js'
import { verifyEmail } from './service.js'
import { verificationQueue } from '../../lib/queue.js'
import { config } from '../../config.js'

export default async function verificationRoutes(app: FastifyInstance) {
  app.post(
    '/v1/verify/email',
    { preHandler: [apiKeyPreHandler] },
    async (request, reply) => {
      const start = Date.now()
      const body = request.body as { email?: string }
      if (!body?.email) {
        return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'email is required' })
      }

      const deducted = await deductCredits(request.workspaceId, 1, CreditTxType.VERIFICATION_DEDUCTION, `Email verification: ${body.email}`)
      if (!deducted) {
        return reply.status(402).send({ type: 'https://leadscale.io/errors/insufficient-credits', title: 'Insufficient Credits', status: 402, detail: 'Not enough credits to verify email' })
      }

      const result = await verifyEmail(body.email, {
        mailcheck: config.enrichment.mailcheckApiKey || undefined,
        zerobounce: config.enrichment.zerobounceApiKey || undefined,
      })

      return {
        success: true,
        data: {
          email: result.email,
          status: result.status,
          confidence_score: result.confidence_score,
          deliverable: result.deliverable,
          checks: result.checks,
          recommendation: result.recommendation,
        },
        meta: { request_id: randomUUID(), credits_deducted: 1, execution_time_ms: Date.now() - start },
      }
    },
  )

  app.post(
    '/v1/verify/batch',
    { preHandler: [apiKeyPreHandler] },
    async (request, reply) => {
      const start = Date.now()
      const body = request.body as { emails?: string[] }
      if (!Array.isArray(body?.emails) || body.emails.length === 0) {
        return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'emails array is required' })
      }
      if (body.emails.length > 100) {
        return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'Maximum 100 emails per batch' })
      }

      const count = body.emails.length
      const deducted = await deductCredits(request.workspaceId, count, CreditTxType.VERIFICATION_DEDUCTION, `Batch email verification: ${count} emails`)
      if (!deducted) {
        return reply.status(402).send({ type: 'https://leadscale.io/errors/insufficient-credits', title: 'Insufficient Credits', status: 402, detail: 'Not enough credits for batch verification' })
      }

      const job = await verificationQueue.add('batch-verify', {
        emails: body.emails,
        workspaceId: request.workspaceId,
      })

      return {
        success: true,
        data: { job_id: job.id, status: 'queued', count },
        meta: { request_id: randomUUID(), credits_deducted: count, execution_time_ms: Date.now() - start },
      }
    },
  )
}

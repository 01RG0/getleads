import type { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { apiKeyPreHandler } from '../tenancy/middleware/apiKey.js'
import { deductCredits, CreditTxType } from '../tenancy/service.js'
import { verifyEmail } from './service.js'
import { verifyPhone } from './phoneVerifier.js'
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
        millionverifier: config.enrichment.millionverifierApiKey || undefined,
        abstractapi: config.enrichment.abstractapiEmailKey || undefined,
        neverbounce: config.enrichment.neverbouncApiKey || undefined,
        truemailHost: config.enrichment.truemailHost || undefined,
        truemailToken: config.enrichment.truemailToken || undefined,
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

  app.post(
    '/v1/verify/domain',
    { preHandler: [apiKeyPreHandler] },
    async (request, reply) => {
      const body = request.body as { domain?: string }
      if (!body?.domain) {
        return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'domain is required' })
      }
      const { checkDomainHealth } = await import('./domainHealth.js')
      const result = await checkDomainHealth(body.domain)
      return { success: true, data: result }
    },
  )

  app.post(
    '/v1/verify/phone',
    { preHandler: [apiKeyPreHandler] },
    async (request, reply) => {
      const start = Date.now()
      const body = request.body as { phone_number?: string; country_code?: string }
      if (!body?.phone_number) {
        return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'phone_number is required' })
      }
      if (!config.enrichment.numverifyApiKey) {
        return reply.status(503).send({ type: 'https://leadscale.io/errors/service-unavailable', title: 'Service Unavailable', status: 503, detail: 'Phone verification is not configured' })
      }

      const deducted = await deductCredits(request.workspaceId, 1, CreditTxType.VERIFICATION_DEDUCTION, `Phone verification: ${body.phone_number}`)
      if (!deducted) {
        return reply.status(402).send({ type: 'https://leadscale.io/errors/insufficient-credits', title: 'Insufficient Credits', status: 402, detail: 'Not enough credits to verify phone' })
      }

      const result = await verifyPhone(body.phone_number)
      if (!result) {
        return reply.status(502).send({ type: 'https://leadscale.io/errors/provider-error', title: 'Provider Error', status: 502, detail: 'Phone verification provider returned an error' })
      }

      return {
        success: true,
        data: result,
        meta: { request_id: randomUUID(), credits_deducted: 1, execution_time_ms: Date.now() - start },
      }
    },
  )
}

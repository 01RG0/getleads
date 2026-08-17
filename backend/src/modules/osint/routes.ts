import type { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { apiKeyPreHandler } from '../tenancy/middleware/apiKey.js'
import { deductCredits, CreditTxType } from '../tenancy/service.js'
import { runOsintPipeline } from './service.js'
import { config } from '../../config.js'

export default async function osintRoutes(app: FastifyInstance) {
  app.post(
    '/v1/osint/crawl',
    { preHandler: [apiKeyPreHandler] },
    async (request, reply) => {
      const start = Date.now()
      const body = request.body as {
        domain?: string
        include_maps?: boolean
        query?: string
        location?: string
      }

      if (!body?.domain) {
        return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'domain is required' })
      }

      const deducted = await deductCredits(request.workspaceId, 2, CreditTxType.ENRICHMENT_DEDUCTION, `OSINT crawl: ${body.domain}`)
      if (!deducted) {
        return reply.status(402).send({ type: 'https://leadscale.io/errors/insufficient-credits', title: 'Insufficient Credits', status: 402, detail: 'Not enough credits (2 required)' })
      }

      const result = await runOsintPipeline(body.domain, {
        scraperApiKey: config.enrichment.scraperApiKey || undefined,
        serperApiKey: body.include_maps ? (config.enrichment.serperApiKey || undefined) : undefined,
        mapsQuery: body.query,
        mapsLocation: body.location,
      })

      return {
        success: true,
        data: result,
        meta: { request_id: randomUUID(), credits_deducted: 2, execution_time_ms: Date.now() - start },
      }
    },
  )
}

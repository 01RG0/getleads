import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/db.js'
import { enrichmentQueue } from '../../lib/queue.js'
import { apiKeyPreHandler } from '../tenancy/middleware/apiKey.js'
import { createBulkJob, getBulkJob } from './bulk.js'

interface BulkContact {
  first_name: string
  last_name: string
  domain: string
  company_name?: string
}

export default async function bulkRoutes(app: FastifyInstance): Promise<void> {
  // POST /v1/enrich/bulk
  app.post('/v1/enrich/bulk', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const body = request.body as { contacts?: BulkContact[] }

    if (!Array.isArray(body?.contacts) || body.contacts.length === 0) {
      return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'contacts must be a non-empty array' })
    }
    if (body.contacts.length > 5000) {
      return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'Maximum 5000 contacts per bulk request' })
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: request.workspaceId },
      select: { creditBalance: true },
    })
    if (!workspace || workspace.creditBalance < body.contacts.length) {
      return reply.status(402).send({ type: 'https://leadscale.io/errors/insufficient-credits', title: 'Insufficient Credits', status: 402, detail: `Need ${body.contacts.length} credits, have ${workspace?.creditBalance ?? 0}` })
    }

    const bulkJob = await createBulkJob(request.workspaceId, body.contacts.length)

    await prisma.$transaction([
      prisma.creditLedger.create({
        data: { workspaceId: request.workspaceId, amount: -body.contacts.length, transactionType: 'ENRICHMENT_DEDUCTION', description: `Bulk enrichment job ${bulkJob.id}`, referenceId: bulkJob.id },
      }),
      prisma.workspace.update({ where: { id: request.workspaceId }, data: { creditBalance: { decrement: body.contacts.length } } }),
      prisma.bulkJob.update({ where: { id: bulkJob.id }, data: { status: 'PROCESSING' } }),
    ])

    // Enqueue each contact individually
    await Promise.all(
      body.contacts.map((c, i) =>
        enrichmentQueue.add(
          'person',
          { contacts: [{ firstName: c.first_name, lastName: c.last_name, domain: c.domain, companyName: c.company_name }], workspaceId: request.workspaceId, requestId: `bulk_${bulkJob.id}_${i}` },
          { jobId: `bulk_${bulkJob.id}_${i}` },
        ),
      ),
    )

    return reply.status(202).send({
      success: true,
      data: { job_id: bulkJob.id, status: 'processing', total: body.contacts.length, poll_url: `/api/v1/enrich/bulk/${bulkJob.id}` },
    })
  })

  // GET /v1/enrich/bulk/:jobId
  app.get<{ Params: { jobId: string } }>('/v1/enrich/bulk/:jobId', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const job = await getBulkJob(request.params.jobId)
    if (!job) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'Bulk job not found' })
    return { success: true, data: { ...job, progress_pct: job.totalRows > 0 ? Math.round((job.processedRows / job.totalRows) * 100) : 0 } }
  })

  // GET /v1/enrich/bulk/:jobId/results
  app.get<{ Params: { jobId: string } }>('/v1/enrich/bulk/:jobId/results', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const { jobId } = request.params
    const query = request.query as { page?: string; limit?: string }
    const page = Math.max(1, parseInt(query.page ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '50')))

    const job = await getBulkJob(jobId)
    if (!job) return reply.status(404).send({ type: 'https://leadscale.io/errors/not-found', title: 'Not Found', status: 404, detail: 'Bulk job not found' })

    const [total, contacts] = await Promise.all([
      prisma.contact.count({ where: { createdAt: { gte: job.createdAt } } }),
      prisma.contact.findMany({
        where: { createdAt: { gte: job.createdAt } },
        include: { company: { select: { name: true, domain: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
    ])

    return { success: true, data: { job_id: jobId, contacts, total, page, limit } }
  })
}

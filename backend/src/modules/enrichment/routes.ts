import { randomUUID } from 'crypto'
import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/db.js'
import { getCache, deleteCache } from '../../lib/redis.js'
import { enrichmentQueue } from '../../lib/queue.js'
import { apiKeyPreHandler } from '../tenancy/middleware/apiKey.js'
import { buildCacheKey, waterfallEnrich } from './service.js'
import type { EnrichmentResult } from './providers/base.js'

interface EnrichPersonBody {
  first_name: string
  last_name: string
  domain: string
  company_name?: string
  linkedin_url?: string
  include_phone?: boolean
  force_reverify?: boolean
}

interface ContactSearchBody {
  filters?: {
    job_titles?: string[]
    seniorities?: string[]
    departments?: string[]
    locations?: string[]
    company_employee_range?: string[]
    industries?: string[]
    technographics?: string[]
  }
  pagination?: {
    page?: number
    limit?: number
  }
  auto_enrich?: boolean
}

export default async function enrichmentRoutes(app: FastifyInstance): Promise<void> {
  // POST /v1/enrich/person
  app.post<{ Body: EnrichPersonBody }>(
    '/v1/enrich/person',
    { preHandler: apiKeyPreHandler },
    async (request, reply) => {
      const startMs = Date.now()
      const requestId = `req_${randomUUID().replace(/-/g, '').slice(0, 12)}`
      const { first_name, last_name, domain, company_name } = request.body

      if (!first_name || !last_name || !domain) {
        return reply.status(400).send({
          type: 'https://leadscale.io/errors/bad-request',
          title: 'Bad Request',
          status: 400,
          detail: 'first_name, last_name, and domain are required',
          instance: request.url,
        })
      }

      const { linkedin_url, include_phone, force_reverify } = request.body

      // force_reverify: bust the cache so the waterfall runs fresh
      const cacheKey = buildCacheKey(first_name, last_name, domain)
      if (force_reverify) await deleteCache(cacheKey)

      // Check cache before touching credits — cached hits cost nothing
      const cachedResult = await getCache<EnrichmentResult>(cacheKey)

      if (cachedResult) {
        // Cache hit — free, return synchronously
        const workspace = await prisma.workspace.findUnique({
          where: { id: request.workspaceId },
          select: { creditBalance: true },
        })
        return {
          success: true,
          data: {
            first_name: cachedResult.firstName ?? first_name,
            last_name: cachedResult.lastName ?? last_name,
            job_title: cachedResult.jobTitle,
            email: cachedResult.email ?? null,
            email_confidence_score: cachedResult.email ? +(cachedResult.confidence * 100).toFixed(1) : null,
            phone: cachedResult.phone ?? null,
            linkedin_url: cachedResult.linkedinUrl ?? null,
            company: cachedResult.company ? {
              name: cachedResult.company.name,
              domain: cachedResult.company.domain,
              employee_count: cachedResult.company.employeeCount,
              industry: cachedResult.company.industry,
              country: cachedResult.company.country,
              city: cachedResult.company.city,
            } : null,
            provenance: { data_source: cachedResult.dataSource, waterfall_tier: 0, cached: true },
          },
          meta: {
            request_id: requestId,
            credits_deducted: 0,
            credits_remaining: workspace?.creditBalance ?? 0,
            execution_time_ms: Date.now() - startMs,
          },
        }
      }

      // Not cached — check and deduct credits, then enqueue async
      const workspace = await prisma.workspace.findUnique({
        where: { id: request.workspaceId },
        select: { creditBalance: true },
      })

      if (!workspace || workspace.creditBalance < 1) {
        return reply.status(402).send({
          type: 'https://leadscale.io/errors/insufficient-credits',
          title: 'Insufficient Credits',
          status: 402,
          detail: 'Not enough credits to perform enrichment',
          instance: request.url,
        })
      }

      const [, updatedWorkspace] = await prisma.$transaction([
        prisma.creditLedger.create({
          data: {
            workspaceId: request.workspaceId,
            amount: -1,
            transactionType: 'ENRICHMENT_DEDUCTION',
            description: `Person enrichment: ${first_name} ${last_name} @ ${domain}`,
            referenceId: requestId,
          },
        }),
        prisma.workspace.update({
          where: { id: request.workspaceId },
          data: { creditBalance: { decrement: 1 } },
          select: { creditBalance: true },
        }),
      ])

      const jobId = `enrich_${requestId}`
      await enrichmentQueue.add(
        'person',
        {
          contacts: [{ firstName: first_name, lastName: last_name, domain, companyName: company_name, linkedinUrl: linkedin_url, includePhone: include_phone }],
          workspaceId: request.workspaceId,
          requestId,
        },
        { jobId },
      )

      return reply.status(202).send({
        success: true,
        data: {
          job_id: jobId,
          status: 'queued',
          poll_url: `/api/v1/enrich/jobs/${jobId}`,
        },
        meta: {
          request_id: requestId,
          credits_deducted: 1,
          credits_remaining: updatedWorkspace.creditBalance,
          execution_time_ms: Date.now() - startMs,
        },
      })
    },
  )

  // GET /v1/enrich/jobs/:jobId — poll async enrichment job status
  app.get<{ Params: { jobId: string } }>(
    '/v1/enrich/jobs/:jobId',
    { preHandler: apiKeyPreHandler },
    async (request, reply) => {
      const { jobId } = request.params
      const job = await enrichmentQueue.getJob(jobId)
      if (!job) {
        return reply.status(404).send({
          type: 'https://leadscale.io/errors/not-found',
          title: 'Not Found',
          status: 404,
          detail: `Job ${jobId} not found`,
          instance: request.url,
        })
      }
      const state = await job.getState()
      const returnValue = job.returnvalue as unknown
      return {
        success: true,
        data: {
          job_id: jobId,
          status: state,
          progress: job.progress,
          result: state === 'completed' ? returnValue : null,
          failed_reason: state === 'failed' ? job.failedReason : null,
        },
      }
    },
  )

  // POST /v1/contacts/search
  app.post<{ Body: ContactSearchBody }>(
    '/v1/contacts/search',
    { preHandler: apiKeyPreHandler },
    async (request, reply) => {
      const startMs = Date.now()
      const requestId = `req_${randomUUID().replace(/-/g, '').slice(0, 12)}`
      const { filters = {}, pagination = {} } = request.body ?? {}

      const page = Math.max(1, pagination.page ?? 1)
      const limit = Math.min(100, Math.max(1, pagination.limit ?? 25))
      const skip = (page - 1) * limit

      // Build Prisma where clause from filters
      const where: Record<string, unknown> = {}

      if (filters.job_titles?.length) {
        where.jobTitle = { in: filters.job_titles }
      }
      if (filters.seniorities?.length) {
        where.seniority = { in: filters.seniorities }
      }
      if (filters.departments?.length) {
        where.department = { in: filters.departments }
      }
      if (filters.locations?.length) {
        where.OR = [
          { city: { in: filters.locations } },
          { country: { in: filters.locations } },
        ]
      }

      const companyWhere: Record<string, unknown> = {}
      if (filters.company_employee_range?.length) {
        companyWhere.employeeRange = { in: filters.company_employee_range }
      }
      if (filters.industries?.length) {
        companyWhere.industry = { in: filters.industries }
      }
      if (Object.keys(companyWhere).length) {
        where.company = { is: companyWhere }
      }

      const [total, contacts] = await Promise.all([
        prisma.contact.count({ where }),
        prisma.contact.findMany({
          where,
          skip,
          take: limit,
          include: {
            company: {
              select: {
                id: true,
                name: true,
                domain: true,
                employeeCount: true,
                industry: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ])

      const executionMs = Date.now() - startMs

      return {
        success: true,
        data: {
          total_results: total,
          page,
          limit,
          contacts: contacts.map((c) => ({
            contact_id: c.id,
            first_name: c.firstName,
            last_name: c.lastName,
            job_title: c.jobTitle,
            seniority: c.seniority,
            department: c.department,
            email: c.email ?? null,
            phone: c.phone ?? null,
            linkedin_url: c.linkedinUrl ?? null,
            enrichment_status: c.emailStatus,
            location: {
              city: c.city ?? null,
              country: c.country ?? null,
            },
            company: c.company
              ? {
                  company_id: c.company.id,
                  name: c.company.name,
                  domain: c.company.domain,
                  employee_count: c.company.employeeCount ?? null,
                  industry: c.company.industry ?? null,
                }
              : null,
          })),
        },
        meta: {
          request_id: requestId,
          credits_deducted: 0,
          execution_time_ms: executionMs,
        },
      }
    },
  )

  // GET /v1/contacts/export — download all workspace contacts as CSV
  app.get(
    '/v1/contacts/export',
    { preHandler: apiKeyPreHandler },
    async (request, reply) => {
      const contacts = await prisma.contact.findMany({
        include: { company: { select: { name: true, domain: true, industry: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10000,
      })

      const header = 'first_name,last_name,email,phone,job_title,linkedin_url,company_name,company_domain,industry,city,country,email_status'
      const escape = (v: unknown) => {
        const s = v == null ? '' : String(v)
        return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
      }
      const rows = contacts.map((c) =>
        [c.firstName, c.lastName, c.email, c.phone, c.jobTitle, c.linkedinUrl,
         c.company?.name, c.company?.domain, c.company?.industry, c.city, c.country, c.emailStatus]
          .map(escape).join(',')
      )

      reply.header('Content-Type', 'text/csv; charset=utf-8')
      reply.header('Content-Disposition', `attachment; filename="leads-${new Date().toISOString().slice(0,10)}.csv"`)
      return reply.send([header, ...rows].join('\n'))
    },
  )
}

import { randomUUID } from 'crypto'
import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/db.js'
import { apiKeyPreHandler } from '../tenancy/middleware/apiKey.js'
import { waterfallEnrich } from './service.js'

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

      // Deduct 1 credit
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

      const { result, tier, cached } = await waterfallEnrich({
        firstName: first_name,
        lastName: last_name,
        domain,
        companyName: company_name,
        workspaceId: request.workspaceId,
      })

      const executionMs = Date.now() - startMs

      return {
        success: true,
        data: {
          first_name: result.firstName ?? first_name,
          last_name: result.lastName ?? last_name,
          job_title: result.jobTitle,
          email: result.email ?? null,
          email_confidence_score: result.email ? +(result.confidence * 100).toFixed(1) : null,
          phone: result.phone ?? null,
          linkedin_url: result.linkedinUrl ?? null,
          company: result.company
            ? {
                name: result.company.name,
                domain: result.company.domain,
                employee_count: result.company.employeeCount,
                industry: result.company.industry,
                country: result.company.country,
                city: result.company.city,
              }
            : null,
          provenance: {
            data_source: result.dataSource,
            waterfall_tier: tier,
            cached,
          },
        },
        meta: {
          request_id: requestId,
          credits_deducted: cached ? 0 : 1,
          credits_remaining: updatedWorkspace.creditBalance,
          execution_time_ms: executionMs,
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
}

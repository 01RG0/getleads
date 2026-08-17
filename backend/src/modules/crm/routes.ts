import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/db.js'
import { apiKeyPreHandler } from '../tenancy/middleware/apiKey.js'
import { hubspotUpsertContact } from './hubspot.js'
import { salesforceGetToken, salesforceUpsertContact } from './salesforce.js'

export default async function crmRoutes(app: FastifyInstance): Promise<void> {
  // POST /v1/crm/hubspot/push — push one or many contacts to HubSpot
  app.post('/v1/crm/hubspot/push', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const body = request.body as { contact_ids?: string[]; access_token?: string }
    if (!body?.access_token) {
      return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'access_token is required' })
    }
    if (!body?.contact_ids?.length) {
      return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: 'contact_ids is required' })
    }

    const contacts = await prisma.contact.findMany({
      where: { id: { in: body.contact_ids } },
      include: { company: { select: { name: true, domain: true } } },
    })

    const results = await Promise.allSettled(
      contacts.map((c) =>
        hubspotUpsertContact(
          {
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email ?? undefined,
            phone: c.phone ?? undefined,
            jobTitle: c.jobTitle ?? undefined,
            linkedinUrl: c.linkedinUrl ?? undefined,
            companyName: c.company?.name ?? undefined,
            companyDomain: c.company?.domain ?? undefined,
          },
          body.access_token!,
        ),
      ),
    )

    const synced = results.filter((r) => r.status === 'fulfilled').map((r) => (r as PromiseFulfilledResult<unknown>).value)
    const failed = results.filter((r) => r.status === 'rejected').length

    return reply.send({ success: true, data: { synced, failed_count: failed } })
  })

  // POST /v1/crm/salesforce/push — push one or many contacts to Salesforce
  app.post('/v1/crm/salesforce/push', { preHandler: apiKeyPreHandler }, async (request, reply) => {
    const body = request.body as {
      contact_ids?: string[]
      client_id?: string
      client_secret?: string
      username?: string
      password?: string
      security_token?: string
    }

    const missing = ['contact_ids', 'client_id', 'client_secret', 'username', 'password', 'security_token'].filter((k) => !(body as Record<string, unknown>)[k])
    if (missing.length) {
      return reply.status(400).send({ type: 'https://leadscale.io/errors/bad-request', title: 'Bad Request', status: 400, detail: `Missing fields: ${missing.join(', ')}` })
    }

    let sfToken: { access_token: string; instance_url: string }
    try {
      sfToken = await salesforceGetToken(body.client_id!, body.client_secret!, body.username!, body.password!, body.security_token!)
    } catch (err) {
      return reply.status(401).send({ type: 'https://leadscale.io/errors/unauthorized', title: 'Salesforce Auth Failed', status: 401, detail: err instanceof Error ? err.message : 'Auth failed' })
    }

    const contacts = await prisma.contact.findMany({
      where: { id: { in: body.contact_ids! } },
      include: { company: { select: { name: true, domain: true } } },
    })

    const results = await Promise.allSettled(
      contacts.map((c) =>
        salesforceUpsertContact(
          {
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email ?? undefined,
            phone: c.phone ?? undefined,
            jobTitle: c.jobTitle ?? undefined,
            companyName: c.company?.name ?? undefined,
          },
          sfToken.access_token,
          sfToken.instance_url,
        ),
      ),
    )

    const synced = results.filter((r) => r.status === 'fulfilled').map((r) => (r as PromiseFulfilledResult<unknown>).value)
    const failed = results.filter((r) => r.status === 'rejected').length

    return reply.send({ success: true, data: { synced, failed_count: failed } })
  })
}

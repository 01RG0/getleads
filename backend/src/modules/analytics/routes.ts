import type { FastifyInstance } from 'fastify'
import { apiKeyPreHandler } from '../tenancy/middleware/apiKey.js'
import { getApiUsageSummary } from './service.js'

export default async function analyticsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/analytics/usage', { preHandler: apiKeyPreHandler }, async (request) => {
    const query = request.query as { days?: string }
    const days = Math.min(90, Math.max(1, parseInt(query.days ?? '30')))
    const summary = await getApiUsageSummary(request.workspaceId, days)
    return { success: true, data: summary }
  })
}

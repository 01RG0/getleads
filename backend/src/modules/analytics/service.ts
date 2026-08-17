import { prisma } from '../../lib/db.js'

export async function getApiUsageSummary(workspaceId: string, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [totalRequests, byEndpoint, creditsByDay] = await Promise.all([
    prisma.apiUsageLog.count({ where: { workspaceId, createdAt: { gte: since } } }),
    prisma.apiUsageLog.groupBy({ by: ['endpoint', 'method'], where: { workspaceId, createdAt: { gte: since } }, _count: { id: true }, _avg: { latencyMs: true }, orderBy: { _count: { id: 'desc' } }, take: 10 }),
    prisma.creditLedger.groupBy({ by: ['transactionType'], where: { workspaceId, createdAt: { gte: since } }, _sum: { amount: true } }),
  ])

  return { totalRequests, topEndpoints: byEndpoint, creditBreakdown: creditsByDay, periodDays: days }
}

export async function logApiCall(workspaceId: string, endpoint: string, method: string, statusCode: number, latencyMs: number, creditsUsed = 0): Promise<void> {
  await prisma.apiUsageLog.create({ data: { workspaceId, endpoint, method, statusCode, latencyMs, creditsUsed } })
}

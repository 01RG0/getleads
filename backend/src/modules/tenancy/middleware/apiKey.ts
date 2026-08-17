import { createHash } from 'crypto'
import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify'
import type { OrgTier } from '@prisma/client'
import { prisma } from '../../../lib/db.js'
import { redisConnection } from '../../../lib/queue.js'

const PLAN_RPM: Record<string, number> = {
  FREE: 300,
  STARTER: 600,
  PRO_GROWTH: 1800,
  AGENCY_UNLIMITED: 6000,
  ENTERPRISE: 12000,
}

declare module 'fastify' {
  interface FastifyRequest {
    workspaceId: string
    orgTier: OrgTier
  }
}

function hashApiKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

export const apiKeyPreHandler: preHandlerHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const authHeader = request.headers['authorization'] ?? ''
  const match = authHeader.match(/^Bearer\s+(.+)$/i)

  if (!match) {
    return reply.status(401).send({
      type: 'https://leadscale.io/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Missing or malformed Authorization header. Expected: Bearer <api-key>',
      instance: request.url,
    })
  }

  const rawKey = match[1]
  const keyHash = hashApiKey(rawKey)

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: {
      workspaceId: true,
      expiresAt: true,
      workspace: {
        select: {
          organization: { select: { tier: true } },
        },
      },
    },
  })

  if (!apiKey) {
    return reply.status(401).send({
      type: 'https://leadscale.io/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Invalid API key',
      instance: request.url,
    })
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return reply.status(401).send({
      type: 'https://leadscale.io/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'API key has expired',
      instance: request.url,
    })
  }

  // Fire-and-forget last used timestamp update
  prisma.apiKey
    .update({
      where: { keyHash },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => undefined)

  request.workspaceId = apiKey.workspaceId
  request.orgTier = apiKey.workspace.organization.tier

  // Plan-aware rate limiting via Upstash Redis INCR
  const tier = apiKey.workspace.organization.tier as string
  const maxRpm = PLAN_RPM[tier] ?? 200
  const windowKey = `ratelimit:${apiKey.workspaceId}:${Math.floor(Date.now() / 60000)}`
  const count = await redisConnection.incr(windowKey)
  if (count === 1) await redisConnection.expire(windowKey, 60)

  reply.header('X-RateLimit-Limit', String(maxRpm))
  reply.header('X-RateLimit-Remaining', String(Math.max(0, maxRpm - count)))

  if (count > maxRpm) {
    return reply.status(429).send({
      type: 'https://leadscale.io/errors/rate-limit-exceeded',
      title: 'Too Many Requests',
      status: 429,
      detail: `Rate limit exceeded. Your plan allows ${maxRpm} requests per minute.`,
      instance: request.url,
    })
  }
}

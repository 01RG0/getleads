import { createHash } from 'crypto'
import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify'
import { prisma } from '../../../lib/db.js'

declare module 'fastify' {
  interface FastifyRequest {
    workspaceId: string
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
}

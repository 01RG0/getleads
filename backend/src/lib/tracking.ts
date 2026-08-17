import { randomUUID } from 'crypto'
import type { FastifyInstance, FastifyRequest } from 'fastify'

export async function registerTracking(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', async (request, reply) => {
    const reqId =
      (request.headers['x-request-id'] as string) ||
      'req_' + randomUUID().replace(/-/g, '').slice(0, 16)

    ;(request as any).requestId = reqId
    reply.header('x-request-id', reqId)
  })

  app.addHook('onResponse', async (request, reply) => {
    const reqId = (request as any).requestId ?? request.id
    const ms = reply.elapsedTime?.toFixed(1)
    const log = {
      reqId,
      method: request.method,
      url: request.url,
      status: reply.statusCode,
      ms,
      workspaceId: (request as any).workspaceId ?? null,
    }

    if (reply.statusCode >= 500) app.log.error(log, 'response')
    else if (reply.statusCode >= 400) app.log.warn(log, 'response')
    else app.log.info(log, 'response')
  })

  app.addHook('onError', async (request, _reply, error) => {
    app.log.error(
      {
        reqId: (request as any).requestId,
        method: request.method,
        url: request.url,
        err: { name: error.name, msg: error.message },
      },
      'error',
    )
  })
}

export function getRequestId(request: FastifyRequest): string {
  return (request as any).requestId ?? (request as any).id ?? 'unknown'
}

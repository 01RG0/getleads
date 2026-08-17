import { Worker } from 'bullmq'
import { prisma } from '../../lib/db.js'
import { redisConnection } from '../../lib/queue.js'
import { signPayload } from './service.js'
import type { WebhookEvent } from '@prisma/client'

interface WebhookJobData {
  webhookId: string
  event: WebhookEvent
  payload: Record<string, unknown>
  ts: number
}

export function startWebhookWorker(): Worker {
  const worker = new Worker<WebhookJobData>(
    'webhooks',
    async (job) => {
      const { webhookId, event, payload } = job.data

      const webhook = await prisma.webhook.findUnique({
        where: { id: webhookId },
        select: { url: true, secretHash: true, isActive: true },
      })

      if (!webhook || !webhook.isActive) return

      const payloadStr = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() })
      const signature = signPayload(webhook.secretHash, event, payloadStr)

      const deliveryId = crypto.randomUUID()
      let statusCode: number | undefined
      let responseBody: string | undefined

      try {
        const res = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-LeadScale-Signature': `sha256=${signature}`,
            'X-LeadScale-Event': event,
            'X-LeadScale-Delivery': deliveryId,
          },
          body: payloadStr,
          signal: AbortSignal.timeout(15000),
        })
        statusCode = res.status
        responseBody = (await res.text()).slice(0, 1000)

        await prisma.webhookDelivery.create({
          data: {
            webhookId,
            event,
            payload: payload as any,
            statusCode,
            responseBody,
            attemptCount: job.attemptsMade + 1,
            lastAttemptAt: new Date(),
            succeededAt: res.ok ? new Date() : null,
          },
        })

        if (!res.ok) throw new Error(`Webhook returned ${statusCode}`)
      } catch (err) {
        await prisma.webhookDelivery.upsert({
          where: { id: deliveryId },
          create: {
            id: deliveryId,
            webhookId,
            event,
            payload: payload as any,
            statusCode,
            responseBody,
            attemptCount: job.attemptsMade + 1,
            lastAttemptAt: new Date(),
          },
          update: {
            statusCode,
            responseBody,
            attemptCount: job.attemptsMade + 1,
            lastAttemptAt: new Date(),
          },
        })
        throw err
      }
    },
    { connection: redisConnection, concurrency: 20 },
  )

  worker.on('error', (err) => {
    console.error('[WebhookWorker] Unhandled error:', err.stack)
  })

  return worker
}

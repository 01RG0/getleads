import { createHash, createHmac } from 'crypto'
import { prisma } from '../../lib/db.js'
import type { WebhookEvent } from '@prisma/client'

export function signPayload(secretHash: string, event: string, payload: string): string {
  return createHmac('sha256', secretHash).update(`${event}.${payload}`).digest('hex')
}

export function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex')
}

export async function dispatchWebhook(
  workspaceId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>,
): Promise<void> {
  const webhooks = await prisma.webhook.findMany({
    where: { workspaceId, isActive: true, events: { has: event } },
    select: { id: true },
  })
  if (webhooks.length === 0) return

  const { webhookQueue } = await import('../../lib/queue.js')
  await Promise.all(
    webhooks.map((w) =>
      webhookQueue.add('deliver', { webhookId: w.id, event, payload, ts: Date.now() }),
    ),
  )
}

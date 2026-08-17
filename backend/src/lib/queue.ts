import { Queue } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  tls: process.env.REDIS_URL?.startsWith('rediss://') ? {} : undefined,
})

// Enrichment queue
export const enrichmentQueue = new Queue('enrichment', {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: false,
  },
})

// Verification queue
export const verificationQueue = new Queue('verification', {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: false,
  },
})

export const enrichmentDLQ = new Queue('enrichment:dlq', {
  connection,
  defaultJobOptions: { removeOnComplete: false, removeOnFail: false },
})

export const verificationDLQ = new Queue('verification:dlq', {
  connection,
  defaultJobOptions: { removeOnComplete: false, removeOnFail: false },
})

export async function getDLQStats(): Promise<{
  enrichment: { waiting: number }
  verification: { waiting: number }
}> {
  const [enrCounts, verCounts] = await Promise.all([
    enrichmentDLQ.getJobCounts('wait', 'delayed', 'failed'),
    verificationDLQ.getJobCounts('wait', 'delayed', 'failed'),
  ])

  return {
    enrichment: { waiting: (enrCounts.wait ?? 0) + (enrCounts.delayed ?? 0) + (enrCounts.failed ?? 0) },
    verification: { waiting: (verCounts.wait ?? 0) + (verCounts.delayed ?? 0) + (verCounts.failed ?? 0) },
  }
}

export const webhookQueue = new Queue('webhooks', {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 500 },
    removeOnFail: false,
  },
})

export { connection as redisConnection }

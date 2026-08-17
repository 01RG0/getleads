import { Worker } from 'bullmq'
import { enrichmentDLQ, redisConnection } from '../../lib/queue.js'
import { waterfallEnrich } from './service.js'

interface EnrichmentJobData {
  contacts: Array<{
    firstName: string
    lastName: string
    domain: string
    companyName?: string
    linkedinUrl?: string
    includePhone?: boolean
    forceReverify?: boolean
  }>
  workspaceId: string
  requestId?: string
}

export function startEnrichmentWorker(): Worker {
  const worker = new Worker<EnrichmentJobData>(
    'enrichment',
    async (job) => {
      const { contacts, workspaceId } = job.data

      const results = []
      for (const contact of contacts) {
        try {
          const enrichResult = await waterfallEnrich({
            firstName: contact.firstName,
            lastName: contact.lastName,
            domain: contact.domain,
            companyName: contact.companyName,
            linkedinUrl: contact.linkedinUrl,
            includePhone: contact.includePhone,
            forceReverify: contact.forceReverify,
            workspaceId,
          })
          results.push({
            contact: `${contact.firstName} ${contact.lastName}`,
            tier: enrichResult.tier,
            cached: enrichResult.cached,
            hasEmail: !!enrichResult.result.email,
          })
        } catch (err) {
          results.push({
            contact: `${contact.firstName} ${contact.lastName}`,
            error: err instanceof Error ? err.message : String(err),
          })
        }

        // Update job progress
        await job.updateProgress(Math.round((results.length / contacts.length) * 100))
      }

      return { processed: results.length, results }
    },
    {
      connection: redisConnection,
      concurrency: 5,
    },
  )

  worker.on('completed', (job) => {
    console.log(`[EnrichmentWorker] Job ${job.id} completed`)
  })

  worker.on('failed', async (job, err) => {
    console.error(`[EnrichmentWorker] Job ${job?.id} failed:`, err.message)

    if (job && job.attemptsMade >= (job.opts?.attempts ?? 5)) {
      await enrichmentDLQ.add('dlq:enrichment', {
        originalJobId: job.id,
        data: job.data,
        failedReason: err.message,
        failedAt: new Date().toISOString(),
      })
    }
  })

  worker.on('error', (err) => {
    console.error('[EnrichmentWorker] Unhandled error:', err.stack)
  })

  return worker
}

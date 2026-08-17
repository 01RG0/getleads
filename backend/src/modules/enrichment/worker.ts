import { Worker } from 'bullmq'
import { redisConnection } from '../../lib/queue.js'
import { waterfallEnrich } from './service.js'

interface EnrichmentJobData {
  contacts: Array<{
    firstName: string
    lastName: string
    domain: string
    companyName?: string
  }>
  workspaceId: string
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

  worker.on('failed', (job, err) => {
    console.error(`[EnrichmentWorker] Job ${job?.id} failed:`, err.message)
  })

  worker.on('error', (err) => {
    console.error('[EnrichmentWorker] Worker error:', err)
  })

  return worker
}

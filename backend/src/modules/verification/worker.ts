import { Worker } from 'bullmq'
import { redisConnection, verificationDLQ } from '../../lib/queue.js'
import { verifyEmail } from './service.js'
import { config } from '../../config.js'

interface VerificationJobData {
  emails: string[]
  workspaceId: string
}

export function startVerificationWorker(): Worker {
  const worker = new Worker<VerificationJobData>(
    'verification',
    async (job) => {
      const { emails } = job.data
      const apiKeys = {
        mailcheck: config.enrichment.mailcheckApiKey || undefined,
        zerobounce: config.enrichment.zerobounceApiKey || undefined,
        millionverifier: config.enrichment.millionverifierApiKey || undefined,
        abstractapi: config.enrichment.abstractapiEmailKey || undefined,
        neverbounce: config.enrichment.neverbouncApiKey || undefined,
        truemailHost: config.enrichment.truemailHost || undefined,
        truemailToken: config.enrichment.truemailToken || undefined,
      }

      const results = []
      for (let i = 0; i < emails.length; i++) {
        const email = emails[i]
        try {
          const result = await verifyEmail(email, apiKeys)
          results.push({ email, status: result.status, score: result.confidence_score })
        } catch (err) {
          results.push({ email, error: err instanceof Error ? err.message : String(err) })
        }
        await job.updateProgress(Math.round(((i + 1) / emails.length) * 100))
      }

      return { processed: results.length, results }
    },
    {
      connection: redisConnection,
      concurrency: 10,
    },
  )

  worker.on('completed', (job) => {
    console.log(`[VerificationWorker] Job ${job.id} completed`)
  })

  worker.on('failed', async (job, err) => {
    console.error(`[VerificationWorker] Job ${job?.id} failed:`, err.message)

    if (job && job.attemptsMade >= (job.opts?.attempts ?? 5)) {
      await verificationDLQ.add('dlq:verification', {
        originalJobId: job.id,
        data: job.data,
        failedReason: err.message,
        failedAt: new Date().toISOString(),
      })
    }
  })

  worker.on('error', (err) => {
    console.error('[VerificationWorker] Unhandled error:', err.stack)
  })

  return worker
}

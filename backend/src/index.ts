import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { prisma } from './lib/db.js'
import { redis } from './lib/redis.js'
import { registerTracking } from './lib/tracking.js'
import { AppError } from './lib/errors.js'
import { config } from './config.js'
import tenancyRoutes from './modules/tenancy/routes.js'
import verificationRoutes from './modules/verification/routes.js'
import enrichmentRoutes from './modules/enrichment/routes.js'
import osintRoutes from './modules/osint/routes.js'
import llmRoutes from './modules/llm/routes.js'
import campaignRoutes from './modules/campaigns/routes.js'
import { startVerificationWorker } from './modules/verification/worker.js'
import { startEnrichmentWorker } from './modules/enrichment/worker.js'
import webhookRoutes, { registerZapierRoutes } from './modules/webhooks/routes.js'
import { startWebhookWorker } from './modules/webhooks/worker.js'
import gdprRoutes from './modules/gdpr/routes.js'
import crmRoutes from './modules/crm/routes.js'
import bulkRoutes from './modules/enrichment/bulkRoutes.js'
import domainRoutes from './modules/enrichment/domainRoutes.js'
import listRoutes from './modules/lists/routes.js'
import scoringRoutes from './modules/scoring/routes.js'
import analyticsRoutes from './modules/analytics/routes.js'
import signalsRoutes from './modules/signals/routes.js'
import extensionRoutes from './modules/extension/routes.js'
import { redisConnection } from './lib/queue.js'

const app = Fastify({
  logger: { level: config.isProd ? 'info' : 'debug' },
})

// Plugins
await app.register(helmet)
await app.register(cors, {
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
})
await app.register(rateLimit, {
  max: 500,
  timeWindow: '1 minute',
  redis: redisConnection,
  keyGenerator: (request) => `global:${request.ip}`,
  addHeaders: {
    'x-ratelimit-limit': true,
    'x-ratelimit-remaining': true,
    'x-ratelimit-reset': true,
  },
})

await registerTracking(app)

app.setSchemaErrorFormatter((errors, _dataVar) => {
  const detail = errors.map((e) => `${e.instancePath || '(root)'} ${e.message}`).join('; ')
  const err = new Error(detail) as Error & { statusCode: number }
  err.statusCode = 400
  return err
})

app.setErrorHandler(async (error, request, reply) => {
  app.log.error(error)
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      type: 'https://leadscale.io/errors/' + error.type,
      title: error.message,
      status: error.statusCode,
      detail: error.detail,
      instance: request.url,
    })
  }
  const status = (error as { statusCode?: number }).statusCode ?? 500
  return reply.status(status).send({ type: 'https://leadscale.io/errors/internal', title: status === 500 ? 'Internal Server Error' : error.message, status, detail: process.env.NODE_ENV !== 'production' ? error.message : 'An unexpected error occurred', instance: request.url })
})

// Health check
app.get('/health', async () => ({
  status: 'ok',
  service: 'leadscale-backend',
  timestamp: new Date().toISOString(),
}))

// Redis health check
app.get('/health/redis', async () => {
  const pong = await redis.ping()
  return { status: pong === 'PONG' ? 'ok' : 'error', redis: pong }
})

app.get('/healthz/liveness', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
}))

app.get('/healthz/readiness', async (_request, reply) => {
  const checks: Record<string, string> = {}

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.db = 'ok'
  } catch {
    checks.db = 'error'
  }

  try {
    const p = await redis.ping()
    checks.redis = p === 'PONG' ? 'ok' : 'error'
  } catch {
    checks.redis = 'error'
  }

  const ok = Object.values(checks).every((value) => value === 'ok')
  return reply.status(ok ? 200 : 503).send({
    status: ok ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  })
})

app.get('/admin/system/metrics', async (request, reply) => {
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.authorization !== 'Bearer ' + process.env.API_SECRET_KEY
  ) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  return {
    uptime_seconds: Math.round(process.uptime()),
    memory_mb: +(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1),
    node_version: process.version,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  }
})

// API status
app.get('/api/v1/status', async () => {
  return { version: '1.0.0', environment: config.nodeEnv }
})

// Module routes
await app.register(tenancyRoutes, { prefix: '/api' })
await app.register(verificationRoutes, { prefix: '/api' })
await app.register(enrichmentRoutes, { prefix: '/api' })
await app.register(osintRoutes, { prefix: '/api' })
await app.register(llmRoutes, { prefix: '/api' })
await app.register(campaignRoutes, { prefix: '/api' })
await app.register(webhookRoutes, { prefix: '/api' })
await app.register(gdprRoutes, { prefix: '/api' })
await app.register(crmRoutes, { prefix: '/api' })
await app.register(bulkRoutes, { prefix: '/api' })
await app.register(domainRoutes, { prefix: '/api' })
await app.register(listRoutes, { prefix: '/api' })
await app.register(scoringRoutes, { prefix: '/api' })
await app.register(analyticsRoutes, { prefix: '/api' })
await app.register(signalsRoutes, { prefix: '/api' })
await app.register(extensionRoutes, { prefix: '/api' })
await app.register(registerZapierRoutes, { prefix: '/api' })

const ev = startEnrichmentWorker()
const vv = startVerificationWorker()
const wv = startWebhookWorker()

// Graceful shutdown
const shutdown = async (signal: string) => {
  app.log.info(`Received ${signal}, shutting down gracefully...`)
  try {
    await Promise.all([ev.close(), vv.close(), wv.close(), app.close()])
    app.log.info('Server closed.')
    process.exit(0)
  } catch (err) {
    app.log.error(err, 'Error during shutdown')
    process.exit(1)
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

// Start server
try {
  await app.listen({ port: config.port, host: config.host })
  app.log.info(`LeadScale backend running on port ${config.port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}

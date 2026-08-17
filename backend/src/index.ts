import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { redis } from './lib/redis.js'
import { config } from './config.js'
import tenancyRoutes from './modules/tenancy/routes.js'
import verificationRoutes from './modules/verification/routes.js'
import enrichmentRoutes from './modules/enrichment/routes.js'
import osintRoutes from './modules/osint/routes.js'
import llmRoutes from './modules/llm/routes.js'
import campaignRoutes from './modules/campaigns/routes.js'
import { startVerificationWorker } from './modules/verification/worker.js'
import { startEnrichmentWorker } from './modules/enrichment/worker.js'

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
  max: 200,
  timeWindow: '1 minute',
})

app.setErrorHandler(async (error, request, reply) => {
  app.log.error(error)
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

const ev = startEnrichmentWorker()
const vv = startVerificationWorker()

// Graceful shutdown
const shutdown = async (signal: string) => {
  app.log.info(`Received ${signal}, shutting down gracefully...`)
  try {
    await Promise.all([ev.close(), vv.close(), app.close()])
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

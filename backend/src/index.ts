import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { redis } from './lib/redis.js'
import { config } from './config.js'

const app = Fastify({
  logger: { level: config.isProd ? 'info' : 'debug' },
})

// Plugins
await app.register(helmet)
await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
})
await app.register(rateLimit, {
  max: 200,
  timeWindow: '1 minute',
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

// API routes (placeholder — expand per feature)
app.get('/api/v1/status', async () => {
  return { version: '1.0.0', environment: process.env.NODE_ENV }
})

try {
  await app.listen({ port: config.port, host: config.host })
  app.log.info(`LeadScale backend running on port ${port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}

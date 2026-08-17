function required(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

function optional(key: string, fallback = ''): string {
  return process.env[key] ?? fallback
}

export const config = {
  // Server
  port: parseInt(optional('PORT', '3001'), 10),
  host: optional('HOST', '0.0.0.0'),
  nodeEnv: optional('NODE_ENV', 'development'),
  isDev: optional('NODE_ENV', 'development') === 'development',
  isProd: optional('NODE_ENV', 'development') === 'production',

  // Database (Supabase)
  databaseUrl: required('DATABASE_URL'),
  directUrl: optional('DIRECT_URL'),   // optional — only needed for migrations

  // Redis (Upstash REST — used by @upstash/redis in both API and edge functions)
  upstash: {
    url: required('UPSTASH_REDIS_REST_URL'),
    token: required('UPSTASH_REDIS_REST_TOKEN'),
  },

  // Redis (standard connection — used by BullMQ/ioredis for queues)
  redisUrl: required('REDIS_URL'),

  // Security
  apiSecretKey: required('API_SECRET_KEY'),
  corsOrigin: optional('CORS_ORIGIN', '*'),

  // External enrichment APIs (all optional — waterfall degrades gracefully)
  enrichment: {
    snovApiUser: optional('SNOV_API_USER'),
    snovApiSecret: optional('SNOV_API_SECRET'),
    pdlApiKey: optional('PDL_API_KEY'),
    tombaApiKey: optional('TOMBA_API_KEY'),
    mailcheckApiKey: optional('MAILCHECK_API_KEY'),
    zerobounceApiKey: optional('ZEROBOUNCE_API_KEY'),
    scraperApiKey: optional('SCRAPERAPI_KEY'),
    numverifyApiKey: optional('NUMVERIFY_API_KEY'),
    serperApiKey: optional('SERPER_API_KEY'),
    huntApiKey: optional('HUNT_API_KEY'),
    apolloApiKey: optional('APOLLO_API_KEY'),
  },
} as const

export type Config = typeof config

import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Rate limiter: 100 requests per 60 seconds per identifier
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '60 s'),
  analytics: true,
  prefix: 'leadscale:ratelimit',
})

// Cache helpers
export async function getCache<T>(key: string): Promise<T | null> {
  return redis.get<T>(key)
}

export async function setCache<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
  await redis.set(key, value, { ex: ttlSeconds })
}

export async function deleteCache(...keys: string[]): Promise<void> {
  if (keys.length > 0) await redis.del(...keys)
}

import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Cache helper with automatic JSON serialization
export async function getCache<T>(key: string): Promise<T | null> {
  return redis.get<T>(key)
}

export async function setCache<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
  await redis.set(key, value, { ex: ttlSeconds })
}

export async function deleteCache(key: string): Promise<void> {
  await redis.del(key)
}

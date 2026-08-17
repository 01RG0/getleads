import { prisma } from '../../lib/db.js'
import { redis } from '../../lib/redis.js'
import { getBreaker } from '../../lib/circuit-breaker.js'
import { ServiceUnavailableError } from '../../lib/errors.js'
import { callOpenAICompat } from './providers/openai-compat.js'
import type { LLMRequest, LLMResponse } from './types.js'

export async function routeLLM(req: LLMRequest): Promise<LLMResponse> {
  const providers = await prisma.aiProvider.findMany({
    where: { isActive: true },
    orderBy: { priorityOrder: 'asc' },
  })

  if (providers.length === 0) {
    throw new Error('No active LLM providers configured')
  }

  const errors: string[] = []

  for (const provider of providers) {
    try {
      // RPM guard using Redis sliding counter
      if (provider.rateLimitRpm) {
        const rpmKey = `llm:rpm:${provider.id}`
        const count = await redis.incr(rpmKey)
        if (count === 1) await redis.expire(rpmKey, 60)
        if (count > provider.rateLimitRpm) {
          console.warn(`[llm/router] RPM limit reached for "${provider.name}", skipping`)
          continue
        }
      }

      const result = await getBreaker(provider.name, {
        requestTimeoutMs: 30000,
        failureThreshold: 3,
        timeoutMs: 120000,
      }).execute(() => callOpenAICompat(provider, req))

      // Write usage log fire-and-forget to avoid blocking the caller
      prisma.aiUsageLog
        .create({
          data: {
            providerId: provider.id,
            taskType: req.taskType,
            promptTokens: result.promptTokens,
            completionTokens: result.completionTokens,
            latencyMs: result.latencyMs,
            isSuccess: true,
          },
        })
        .catch((err: unknown) => {
          console.error('[llm/router] Failed to write AiUsageLog:', err)
        })

      return result
    } catch (err) {
      if (err instanceof ServiceUnavailableError) {
        console.warn(`[llm/router] Circuit open for "${provider.name}", skipping`)
        errors.push(`${provider.name}: circuit open`)
        continue
      }
      const message = err instanceof Error ? err.message : String(err)
      console.warn(`[llm/router] Provider "${provider.name}" failed: ${message}`)
      errors.push(`${provider.name}: ${message}`)

      // Best-effort failure log
      prisma.aiUsageLog
        .create({
          data: {
            providerId: provider.id,
            taskType: req.taskType,
            promptTokens: 0,
            completionTokens: 0,
            latencyMs: 0,
            isSuccess: false,
            errorMessage: message.slice(0, 500),
          },
        })
        .catch(() => undefined)
    }
  }

  throw new Error(`All LLM providers failed:\n${errors.join('\n')}`)
}

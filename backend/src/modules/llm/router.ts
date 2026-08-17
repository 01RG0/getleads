import { prisma } from '../../lib/db.js'
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
      const result = await callOpenAICompat(provider, req)

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

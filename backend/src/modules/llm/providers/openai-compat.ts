import type { LLMRequest, LLMResponse } from '../types.js'

// Encryption is TBD — for now return the raw stored value
function decryptApiKey(encrypted: string): string {
  return encrypted
}

interface ProviderConfig {
  name: string
  baseUrl: string
  apiKeyEncrypted: string
}

interface OpenAICompatChoice {
  message: { content: string }
}

interface OpenAICompatUsage {
  prompt_tokens: number
  completion_tokens: number
}

interface OpenAICompatResponse {
  choices: OpenAICompatChoice[]
  model: string
  usage: OpenAICompatUsage
}

export async function callOpenAICompat(
  provider: ProviderConfig,
  req: LLMRequest,
): Promise<LLMResponse> {
  const apiKey = decryptApiKey(provider.apiKeyEncrypted)
  const url = `${provider.baseUrl.replace(/\/$/, '')}/chat/completions`

  const body: Record<string, unknown> = {
    messages: req.messages,
    stream: false,
  }
  if (req.model) body.model = req.model
  if (req.maxTokens !== undefined) body.max_tokens = req.maxTokens
  if (req.temperature !== undefined) body.temperature = req.temperature

  const startMs = Date.now()

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText)
    throw new Error(`Provider ${provider.name} returned HTTP ${response.status}: ${text}`)
  }

  const latencyMs = Date.now() - startMs
  const data = (await response.json()) as OpenAICompatResponse

  const content = data.choices?.[0]?.message?.content
  if (content === undefined || content === null) {
    throw new Error(`Provider ${provider.name} returned no content in choices[0].message.content`)
  }

  return {
    content,
    model: data.model ?? req.model ?? 'unknown',
    provider: provider.name,
    promptTokens: data.usage?.prompt_tokens ?? 0,
    completionTokens: data.usage?.completion_tokens ?? 0,
    latencyMs,
  }
}

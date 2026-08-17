export interface LLMRequest {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  model?: string
  maxTokens?: number
  temperature?: number
  taskType: string
}

export interface LLMResponse {
  content: string
  model: string
  provider: string
  promptTokens: number
  completionTokens: number
  latencyMs: number
}

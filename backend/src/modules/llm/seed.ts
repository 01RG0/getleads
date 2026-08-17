import { prisma } from '../../lib/db.js'

const providers = [
  { name: 'Groq Llama 3.3 70B', baseUrl: 'https://api.groq.com/openai/v1', envKey: 'GROQ_API_KEY', priorityOrder: 1 },
  { name: 'Gemini 2.0 Flash', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', envKey: 'GEMINI_API_KEY', priorityOrder: 2 },
  { name: 'DeepSeek Chat', baseUrl: 'https://api.deepseek.com', envKey: 'DEEPSEEK_API_KEY', priorityOrder: 3 },
  { name: 'Together AI Llama 3.3', baseUrl: 'https://api.together.xyz/v1', envKey: 'TOGETHER_API_KEY', priorityOrder: 4 },
  { name: 'Cerebras Llama 3.3', baseUrl: 'https://api.cerebras.ai/v1', envKey: 'CEREBRAS_API_KEY', priorityOrder: 5 },
  { name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', envKey: 'OPENROUTER_API_KEY', priorityOrder: 6 },
  { name: 'GitHub Models', baseUrl: 'https://models.inference.ai.azure.com', envKey: 'GITHUB_MODELS_TOKEN', priorityOrder: 7 },
  { name: 'Mistral', baseUrl: 'https://api.mistral.ai/v1', envKey: 'MISTRAL_API_KEY', priorityOrder: 8 },
  { name: 'Cohere', baseUrl: 'https://api.cohere.com/compatibility/v1', envKey: 'COHERE_API_KEY', priorityOrder: 9 },
  { name: 'NVIDIA NIM', baseUrl: 'https://integrate.api.nvidia.com/v1', envKey: 'NVIDIA_API_KEY', priorityOrder: 10 },
  { name: 'SambaNova', baseUrl: 'https://api.sambanova.ai/v1', envKey: 'SAMBANOVA_API_KEY', priorityOrder: 11 },
  { name: 'Voyage AI', baseUrl: 'https://api.voyageai.com/v1', envKey: 'VOYAGE_API_KEY', priorityOrder: 12 },
  { name: 'Fireworks AI', baseUrl: 'https://api.fireworks.ai/inference/v1', envKey: 'FIREWORKS_API_KEY', priorityOrder: 13 },
  { name: 'Perplexity', baseUrl: 'https://api.perplexity.ai', envKey: 'PERPLEXITY_API_KEY', priorityOrder: 14 },
  { name: 'HuggingFace', baseUrl: 'https://router.huggingface.co/v1', envKey: 'HUGGINGFACE_TOKEN', priorityOrder: 15 },
]

for (const p of providers) {
  const apiKey = process.env[p.envKey] ?? ''
  await prisma.aiProvider.upsert({
    where: { name: p.name },
    create: { name: p.name, baseUrl: p.baseUrl, apiKeyEncrypted: apiKey, isActive: !!apiKey, priorityOrder: p.priorityOrder },
    update: { baseUrl: p.baseUrl, apiKeyEncrypted: apiKey, isActive: !!apiKey },
  })
  console.log('Upserted: ' + p.name)
}

await prisma.$disconnect()

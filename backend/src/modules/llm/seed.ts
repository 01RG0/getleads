import { prisma } from '../../lib/db.js'

const providers = [
  { name: 'Groq Llama 3.3 70B', baseUrl: 'https://api.groq.com/openai/v1', envKey: 'GROQ_API_KEY', priorityOrder: 1 },
  { name: 'Gemini 2.0 Flash', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', envKey: 'GEMINI_API_KEY', priorityOrder: 2 },
  { name: 'DeepSeek Chat', baseUrl: 'https://api.deepseek.com', envKey: 'DEEPSEEK_API_KEY', priorityOrder: 3 },
  { name: 'Together AI Llama 3.3', baseUrl: 'https://api.together.xyz/v1', envKey: 'TOGETHER_API_KEY', priorityOrder: 4 },
  { name: 'Cerebras Llama 3.3', baseUrl: 'https://api.cerebras.ai/v1', envKey: 'CEREBRAS_API_KEY', priorityOrder: 5 },
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

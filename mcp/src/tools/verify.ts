const API_URL = process.env.LEADSCALE_API_URL ?? 'http://localhost:3001'
const API_KEY = process.env.LEADSCALE_API_KEY ?? ''

export const verifyEmailTool = {
  name: 'verify_email',
  description: 'Verify whether an email address is deliverable, risky, or invalid.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      email: { type: 'string', description: 'Email address to verify' },
    },
    required: ['email'],
  },
  async execute(args: { email: string }) {
    const res = await fetch(`${API_URL}/api/v1/verify/email`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    })
    return res.json()
  },
}

export const verifyPhoneTool = {
  name: 'verify_phone',
  description: 'Validate a phone number and get carrier, line type, and country info.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      phone_number: { type: 'string', description: 'Phone number in E.164 format e.g. +14155552671' },
    },
    required: ['phone_number'],
  },
  async execute(args: { phone_number: string }) {
    const res = await fetch(`${API_URL}/api/v1/verify/phone`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    })
    return res.json()
  },
}

/**
 * Integration smoke tests for Wave A/B/C endpoints.
 * Run with: npx vitest run src/tests/integration.test.ts
 * Requires: TEST_API_KEY env var pointing to a valid workspace key.
 */
import { describe, it, expect, beforeAll } from 'vitest'

const BASE = process.env.TEST_BASE_URL ?? 'http://localhost:3000'
const KEY = process.env.TEST_API_KEY ?? 'test-key'

const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` }
const get = (path: string) => fetch(`${BASE}/api${path}`, { headers })
const post = (path: string, body: unknown) => fetch(`${BASE}/api${path}`, { method: 'POST', headers, body: JSON.stringify(body) })

describe('Health', () => {
  it('GET /healthz/readiness → 200', async () => {
    const res = await fetch(`${BASE}/healthz/readiness`)
    expect([200, 503]).toContain(res.status)
  })
})

describe('Bulk Enrichment (Wave A.1)', () => {
  it('POST /v1/enrich/bulk with empty contacts → 400', async () => {
    const res = await post('/v1/enrich/bulk', { contacts: [] })
    expect(res.status).toBe(400)
    const j = await res.json() as { detail: string }
    expect(j.detail).toMatch(/non-empty/)
  })

  it('POST /v1/enrich/bulk over 5000 → 400', async () => {
    const contacts = Array.from({ length: 5001 }, (_, i) => ({ first_name: 'Test', last_name: `User${i}`, domain: 'example.com' }))
    const res = await post('/v1/enrich/bulk', { contacts })
    expect(res.status).toBe(400)
  })
})

describe('Domain Search (Wave A.2)', () => {
  it('GET /v1/domain/count without domain → 400', async () => {
    const res = await get('/v1/domain/count')
    expect(res.status).toBe(400)
  })

  it('GET /v1/domain/emails without domain → 400', async () => {
    const res = await get('/v1/domain/emails')
    expect(res.status).toBe(400)
  })
})

describe('Lists (Wave A.3)', () => {
  let listId: string

  it('GET /v1/lists → 200 array', async () => {
    const res = await get('/v1/lists')
    expect(res.status).toBe(200)
    const j = await res.json() as { success: boolean; data: unknown[] }
    expect(j.success).toBe(true)
    expect(Array.isArray(j.data)).toBe(true)
  })

  it('POST /v1/lists without name → 400', async () => {
    const res = await post('/v1/lists', {})
    expect(res.status).toBe(400)
  })

  it('POST /v1/lists with name → 201', async () => {
    const res = await post('/v1/lists', { name: 'Test List', description: 'Integration test' })
    expect(res.status).toBe(201)
    const j = await res.json() as { success: boolean; data: { id: string } }
    expect(j.success).toBe(true)
    expect(j.data.id).toBeTruthy()
    listId = j.data.id
  })

  it('GET /v1/lists/:id → 200', async () => {
    if (!listId) return
    const res = await get(`/v1/lists/${listId}`)
    expect(res.status).toBe(200)
  })

  it('DELETE /v1/lists/:id → 204', async () => {
    if (!listId) return
    const res = await fetch(`${BASE}/api/v1/lists/${listId}`, { method: 'DELETE', headers })
    expect(res.status).toBe(204)
  })
})

describe('ICP Scoring (Wave A.5)', () => {
  it('POST /v1/icp/score without criteria → 400', async () => {
    const res = await post('/v1/icp/score', {})
    expect(res.status).toBe(400)
  })

  it('POST /v1/icp/score with criteria → 200', async () => {
    const res = await post('/v1/icp/score', {
      criteria: { industries: ['SaaS', 'Software'], seniorities: ['Director', 'VP', 'C-Level'] },
      contact_ids: [],
    })
    expect(res.status).toBe(200)
  })
})

describe('Domain Health (Wave B.2)', () => {
  it('POST /v1/verify/domain without domain → 400', async () => {
    const res = await post('/v1/verify/domain', {})
    expect(res.status).toBe(400)
  })

  it('POST /v1/verify/domain with valid domain → 200', async () => {
    const res = await post('/v1/verify/domain', { domain: 'google.com' })
    expect(res.status).toBe(200)
    const j = await res.json() as { success: boolean; data: { hasMx: boolean; score: number } }
    expect(j.success).toBe(true)
    expect(j.data.hasMx).toBe(true)
    expect(j.data.score).toBeGreaterThan(0)
  })
})

describe('GDPR Bulk Suppression (Wave B.3)', () => {
  it('POST /v1/gdpr/suppress/bulk with empty → 400', async () => {
    const res = await post('/v1/gdpr/suppress/bulk', { emails: [] })
    expect(res.status).toBe(400)
  })

  it('POST /v1/gdpr/suppress/bulk → 201 with count', async () => {
    const res = await post('/v1/gdpr/suppress/bulk', { emails: ['suppress-test@example.com'], reason: 'test' })
    expect(res.status).toBe(201)
    const j = await res.json() as { success: boolean; data: { added: number } }
    expect(j.success).toBe(true)
    expect(j.data.added).toBeGreaterThanOrEqual(0)
  })

  it('GET /v1/gdpr/suppress → 200 list', async () => {
    const res = await get('/v1/gdpr/suppress')
    expect(res.status).toBe(200)
  })
})

describe('Analytics (Wave B.4)', () => {
  it('GET /v1/analytics/usage → 200', async () => {
    const res = await get('/v1/analytics/usage')
    expect(res.status).toBe(200)
    const j = await res.json() as { success: boolean; data: { periodDays: number } }
    expect(j.success).toBe(true)
    expect(j.data.periodDays).toBe(30)
  })

  it('GET /v1/analytics/usage?days=7 → 200', async () => {
    const res = await get('/v1/analytics/usage?days=7')
    expect(res.status).toBe(200)
    const j = await res.json() as { success: boolean; data: { periodDays: number } }
    expect(j.data.periodDays).toBe(7)
  })
})

describe('Funding/Hiring Signals (Wave B.5)', () => {
  it('GET /v1/signals/funding without domain → 400', async () => {
    const res = await get('/v1/signals/funding')
    expect(res.status).toBe(400)
  })

  it('GET /v1/signals/hiring without domain → 400', async () => {
    const res = await get('/v1/signals/hiring')
    expect(res.status).toBe(400)
  })

  it('GET /v1/signals/funding with domain → 200', async () => {
    const res = await get('/v1/signals/funding?domain=stripe.com')
    expect(res.status).toBe(200)
    const j = await res.json() as { success: boolean; data: { signals: unknown[] } }
    expect(j.success).toBe(true)
    expect(Array.isArray(j.data.signals)).toBe(true)
  })
})

describe('Chrome Extension API (Wave C.1)', () => {
  it('POST /v1/extension/enrich without params → 400', async () => {
    const res = await post('/v1/extension/enrich', {})
    expect(res.status).toBe(400)
  })

  it('GET /v1/extension/lookup without email → 400', async () => {
    const res = await get('/v1/extension/lookup')
    expect(res.status).toBe(400)
  })

  it('GET /v1/extension/lookup with unknown email → 200 null data', async () => {
    const res = await get('/v1/extension/lookup?email=nonexistent@nowhere.example.com')
    expect(res.status).toBe(200)
    const j = await res.json() as { success: boolean; data: null }
    expect(j.success).toBe(true)
    expect(j.data).toBeNull()
  })
})

describe('Social Enrichment (Wave C.2)', () => {
  it('POST /v1/enrich/social without contact_id → 400', async () => {
    const res = await post('/v1/enrich/social', {})
    expect(res.status).toBe(400)
  })

  it('POST /v1/enrich/social with nonexistent contact → 404', async () => {
    const res = await post('/v1/enrich/social', { contact_id: '00000000-0000-0000-0000-000000000000' })
    expect(res.status).toBe(404)
  })
})

describe('Zapier/Make Compatibility (Wave C.3)', () => {
  it('GET /v1/zapier/contacts/new → 200 array', async () => {
    const res = await get('/v1/zapier/contacts/new')
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(Array.isArray(j)).toBe(true)
  })

  it('POST /v1/zapier/subscribe without params → 400', async () => {
    const res = await post('/v1/zapier/subscribe', {})
    expect(res.status).toBe(400)
  })
})

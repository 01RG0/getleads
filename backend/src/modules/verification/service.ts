import { prisma } from '../../lib/db.js'
import { setCache, getCache } from '../../lib/redis.js'
import { runStage1 } from './stage1.js'
import { runStage2 } from './stage2.js'
import { runStage3 } from './stage3.js'
import { EmailStatus } from '@prisma/client'

const CACHE_TTL = 1209600 // 14 days

export interface VerificationResult {
  email: string
  status: EmailStatus
  confidence_score: number
  deliverable: boolean
  checks: {
    syntax_valid: boolean
    mx_records_found: boolean
    smtp_handshake_success: boolean
    is_catch_all: boolean
    is_disposable: boolean
    is_role_account: boolean
    is_honeypot: boolean
  }
  recommendation: string
  provider_used: string
  latency_ms: number
  cached: boolean
}

const ROLE_PREFIXES = new Set(['admin', 'info', 'support', 'sales', 'contact', 'hello', 'noreply', 'no-reply', 'webmaster', 'postmaster', 'help', 'billing'])

function isRoleAccount(email: string): boolean {
  const local = email.split('@')[0].toLowerCase()
  return ROLE_PREFIXES.has(local)
}

export async function verifyEmail(
  email: string,
  apiKeys: { mailcheck?: string; zerobounce?: string },
  contactId?: string,
): Promise<VerificationResult> {
  const cacheKey = `verify:${email.toLowerCase()}`
  const cached = await getCache<VerificationResult>(cacheKey)
  if (cached) return { ...cached, cached: true }

  const start = Date.now()
  const normalised = email.toLowerCase().trim()

  const stage1 = await runStage1(normalised)

  if (!stage1.valid) {
    const result: VerificationResult = {
      email: normalised,
      status: EmailStatus.INVALID,
      confidence_score: 0,
      deliverable: false,
      checks: {
        syntax_valid: stage1.reason !== 'invalid_syntax',
        mx_records_found: false,
        smtp_handshake_success: false,
        is_catch_all: false,
        is_disposable: stage1.isDisposable,
        is_role_account: isRoleAccount(normalised),
        is_honeypot: false,
      },
      recommendation: 'do_not_send',
      provider_used: 'stage1',
      latency_ms: Date.now() - start,
      cached: false,
    }
    await setCache(cacheKey, result, CACHE_TTL)
    return result
  }

  const stage2 = await runStage2(normalised, apiKeys)
  const stage3 = runStage3(normalised, stage2, stage1.mxRecords)

  const result: VerificationResult = {
    email: normalised,
    status: stage3.status,
    confidence_score: stage3.score,
    deliverable: stage2.deliverable || stage2.isCatchAll,
    checks: {
      syntax_valid: true,
      mx_records_found: stage1.mxRecords.length > 0,
      smtp_handshake_success: stage2.smtpCode === '250',
      is_catch_all: stage2.isCatchAll,
      is_disposable: stage2.isDisposable || stage1.isDisposable,
      is_role_account: isRoleAccount(normalised),
      is_honeypot: false,
    },
    recommendation: stage3.recommendation,
    provider_used: stage2.provider,
    latency_ms: Date.now() - start,
    cached: false,
  }

  await setCache(cacheKey, result, CACHE_TTL)

  await prisma.verificationLog.create({
    data: {
      contactId: contactId ?? null,
      email: normalised,
      status: stage3.status,
      mxValid: stage1.mxRecords.length > 0,
      smtpCode: stage2.smtpCode,
      smtpResponse: stage2.provider,
      isCatchAll: stage2.isCatchAll,
      isDisposable: result.checks.is_disposable,
      providerUsed: stage2.provider,
      latencyMs: result.latency_ms,
    },
  }).catch(() => undefined)

  return result
}

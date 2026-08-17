import { EmailStatus } from '@prisma/client'
import type { Stage2Result } from './stage2.js'

export interface Stage3Result {
  score: number
  status: EmailStatus
  recommendation: string
}

const GOOGLE_MX_PATTERN = /aspmx\.l\.google\.com|googlemail\.com/i
const MICROSOFT_MX_PATTERN = /mail\.protection\.outlook\.com|microsoft\.com/i

export function runStage3(email: string, stage2: Stage2Result, mxRecords: string[]): Stage3Result {
  let score: number
  let status: EmailStatus

  if (stage2.smtpCode.startsWith('5')) {
    score = 0
    status = EmailStatus.INVALID
  } else if (stage2.isCatchAll) {
    score = 75
    status = EmailStatus.DELIVERABLE_CATCH_ALL
  } else if (stage2.deliverable) {
    score = 95
    status = EmailStatus.GUARANTEED_DELIVERABLE
  } else if (stage2.provider === 'none') {
    score = 40
    status = EmailStatus.RISKY
  } else {
    score = 30
    status = EmailStatus.RISKY
  }

  const primaryMx = mxRecords[0] ?? ''
  if (GOOGLE_MX_PATTERN.test(primaryMx) || MICROSOFT_MX_PATTERN.test(primaryMx)) {
    score = Math.min(100, score + 5)
  }

  let recommendation: string
  if (score >= 85) recommendation = 'safe_to_send'
  else if (score >= 60) recommendation = 'use_with_caution'
  else recommendation = 'do_not_send'

  return { score, status, recommendation }
}

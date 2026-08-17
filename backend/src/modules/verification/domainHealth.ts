import { getBreaker } from '../../lib/circuit-breaker.js'
import dns from 'dns/promises'

export interface DomainHealthResult {
  domain: string
  mxRecords: string[]
  hasMx: boolean
  spfRecord: string | null
  dmarcRecord: string | null
  hasDmarc: boolean
  hasSpf: boolean
  score: number
}

export async function checkDomainHealth(domain: string): Promise<DomainHealthResult> {
  return getBreaker('domain-health-dns', { requestTimeoutMs: 10000 }).execute(async () => {
    const [mxResult, txtResult, dmarcResult] = await Promise.allSettled([
      dns.resolveMx(domain),
      dns.resolveTxt(domain),
      dns.resolveTxt(`_dmarc.${domain}`),
    ])

    const mxRecords = mxResult.status === 'fulfilled' ? mxResult.value.map((r) => r.exchange) : []
    const txtRecords = txtResult.status === 'fulfilled' ? txtResult.value.flat() : []
    const dmarcRecords = dmarcResult.status === 'fulfilled' ? dmarcResult.value.flat() : []

    const spfRecord = txtRecords.find((r) => r.startsWith('v=spf1')) ?? null
    const dmarcRecord = dmarcRecords.find((r) => r.startsWith('v=DMARC1')) ?? null

    const hasMx = mxRecords.length > 0
    const hasSpf = spfRecord !== null
    const hasDmarc = dmarcRecord !== null

    let score = 0
    if (hasMx) score += 40
    if (hasSpf) score += 30
    if (hasDmarc) score += 30

    return { domain, mxRecords, hasMx, spfRecord, dmarcRecord, hasDmarc, hasSpf, score }
  })
}

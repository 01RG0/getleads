import { spawn } from 'node:child_process'

export interface MosintResult {
  email: string
  breaches: string[]
  social_profiles: string[]
  dns_records: string[]
  related_domains: string[]
}

const normalizeResult = (email: string, data: Partial<MosintResult>): MosintResult => ({
  email,
  breaches: data.breaches ?? [],
  social_profiles: data.social_profiles ?? [],
  dns_records: data.dns_records ?? [],
  related_domains: data.related_domains ?? [],
})

export async function runMosint(email: string): Promise<MosintResult | null> {
  const workerUrl = process.env.MOSINT_WORKER_URL
  if (workerUrl) {
    try {
      const res = await fetch(`${workerUrl}/osint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        signal: AbortSignal.timeout(60000),
      })
      if (res.ok) return normalizeResult(email, (await res.json()) as Partial<MosintResult>)
    } catch {}
  }

  try {
    return await new Promise<MosintResult>((resolve, reject) => {
      const proc = spawn('mosint', ['-e', email, '-json'], { timeout: 60000 })
      let out = ''
      proc.stdout.on('data', (data: Buffer) => { out += data.toString() })
      proc.on('close', () => {
        try {
          resolve(normalizeResult(email, JSON.parse(out) as Partial<MosintResult>))
        } catch {
          reject(new Error('mosint parse error'))
        }
      })
      proc.on('error', reject)
    })
  } catch {}
  return null
}

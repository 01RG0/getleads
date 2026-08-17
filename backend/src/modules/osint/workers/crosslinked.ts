import { spawn } from 'node:child_process'
import { readFile, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export interface CrosslinkedResult {
  domain: string
  company: string
  emails: string[]
  names: string[]
}

async function callCrosslinkedService(company: string, domain: string, workerUrl: string): Promise<CrosslinkedResult> {
  const res = await fetch(`${workerUrl}/enumerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company, domain, format: '{f}{last}@{domain}' }),
    signal: AbortSignal.timeout(120000),
  })
  if (!res.ok) throw new Error(`crosslinked error: ${res.status}`)

  const data = (await res.json()) as { emails?: string[]; names?: string[] }
  return { domain, company, emails: data.emails ?? [], names: data.names ?? [] }
}

async function callCrosslinkedLocal(company: string, domain: string): Promise<CrosslinkedResult> {
  const outputPath = join(tmpdir(), `crosslinked-${process.pid}-${Date.now()}.csv`)
  return new Promise((resolve) => {
    const proc = spawn('crosslinked', ['-f', '{f}{last}@{domain}', company, '-o', outputPath], { timeout: 120000 })
    const empty = () => resolve({ domain, company, emails: [], names: [] })
    proc.on('close', () => {
      readFile(outputPath, 'utf8')
        .then((csv) => {
          const emails = csv.split('\n').map((line) => line.trim()).filter((line) => line.includes(`@${domain}`))
          resolve({ domain, company, emails, names: [] })
        })
        .catch(empty)
        .finally(() => unlink(outputPath).catch(() => undefined))
    })
    proc.on('error', empty)
  })
}

export async function enumerateCompanyEmails(company: string, domain: string): Promise<CrosslinkedResult | null> {
  const workerUrl = process.env.CROSSLINKED_WORKER_URL
  if (workerUrl) {
    try {
      return await callCrosslinkedService(company, domain, workerUrl)
    } catch {}
  }
  try {
    return await callCrosslinkedLocal(company, domain)
  } catch {}
  return null
}

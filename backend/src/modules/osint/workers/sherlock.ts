import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'

export interface SherlockResult {
  username: string
  found_on: string[]
  not_found_on: string[]
  total_found: number
}

export async function huntUsername(username: string): Promise<SherlockResult | null> {
  const workerUrl = process.env.SHERLOCK_WORKER_URL
  if (workerUrl) {
    try {
      const res = await fetch(workerUrl + '/hunt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
        signal: AbortSignal.timeout(120000),
      })
      if (res.ok) {
        const data = await res.json() as { found?: string[]; not_found?: string[] }
        const foundOn = data.found ?? []
        return {
          username,
          found_on: foundOn,
          not_found_on: data.not_found ?? [],
          total_found: foundOn.length,
        }
      }
    } catch {}
  }

  try {
    return await new Promise<SherlockResult>((resolve, reject) => {
      const outputPath = '/tmp/sherlock_' + username + '.json'
      const proc = spawn('sherlock', ['--json', '--output', outputPath, username], { timeout: 120000 })
      proc.on('close', () => {
        readFile(outputPath, 'utf8').then((raw) => {
          const result = JSON.parse(raw) as Record<string, { status?: string; url?: string }>
          const found = Object.entries(result)
            .filter(([, value]) => value.status === 'Claimed')
            .map(([network]) => network)
          resolve({ username, found_on: found, not_found_on: [], total_found: found.length })
        }).catch(reject)
      })
      proc.on('error', reject)
    })
  } catch {}

  return null
}
